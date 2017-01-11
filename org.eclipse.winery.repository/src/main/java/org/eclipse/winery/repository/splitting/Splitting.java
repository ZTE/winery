/*******************************************************************************
 * Copyright (c) 2017 University of Stuttgart.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *    Karoline Saatkamp, Oliver Kopp - initial API and implementation and/or initial documentation
 *******************************************************************************/

package org.eclipse.winery.repository.splitting;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.eclipse.winery.common.ModelUtilities;
import org.eclipse.winery.common.ids.definitions.ServiceTemplateId;
import org.eclipse.winery.model.tosca.TCapability;
import org.eclipse.winery.model.tosca.TNodeTemplate;
import org.eclipse.winery.model.tosca.TRelationshipTemplate;
import org.eclipse.winery.model.tosca.TTopologyTemplate;
import org.eclipse.winery.repository.backend.BackendUtils;
import org.eclipse.winery.repository.backend.Repository;
import org.eclipse.winery.repository.resources.AbstractComponentsResource;
import org.eclipse.winery.repository.resources.servicetemplates.ServiceTemplateResource;
public class Splitting {

	private final TCapability HOSTED_ON_CAPABILITY;

	public Splitting() {
		HOSTED_ON_CAPABILITY = new TCapability();
		//HOSTED_ON_CAPABILITY.setType();
	}

	public Object test() {
		return ProviderRepository.INSTANCE.getAllNodeTemplatesForLocationAndOfferingCapability("IAASVSphere", HOSTED_ON_CAPABILITY);
	}

	/**
	 * Splits the topology template of the given service template.
	 * Creates a new service template with "-split" suffix as id.
	 * Any existing "-split" service tempate will be deleted.
	 */
	public ServiceTemplateId splitTopologyOfServiceTemplate(ServiceTemplateId id) throws IOException {
		ServiceTemplateResource serviceTempateResource = (ServiceTemplateResource) AbstractComponentsResource.getComponentInstaceResource(id);

		// create wrapper service template
		ServiceTemplateId newServiceTemplateId = new ServiceTemplateId(id.getNamespace().getDecoded(), id.getXmlId().getDecoded() + "-split", false);
		Repository.INSTANCE.forceDelete(newServiceTemplateId);
		Repository.INSTANCE.flagAsExisting(newServiceTemplateId);
		ServiceTemplateResource newServiceTempateResource = (ServiceTemplateResource) AbstractComponentsResource.getComponentInstaceResource(newServiceTemplateId);

		TTopologyTemplate newTopologyTemplate = split(serviceTempateResource.getServiceTemplate().getTopologyTemplate());
		newServiceTempateResource.getServiceTemplate().setTopologyTemplate(newTopologyTemplate);
		newServiceTempateResource.persist();
		return newServiceTemplateId;
	}

    /*
	 *
	 * The method checks if a topology template is valid. The topology is valid if all successor nodes which are
	 * connected by hostedOn relationships have no other target assigned
	 *
	 * @param topologyTemplate the topology template which should be checked
	 * @return true if the topology template is valid
	 */
	public boolean checkValidTopology (TTopologyTemplate topologyTemplate){
		Map<TNodeTemplate, Set<TNodeTemplate>> transitiveAndDirectSuccessors = new HashMap<>();
		transitiveAndDirectSuccessors = computeTransitiveClosure(topologyTemplate);

		for (TNodeTemplate node : getNodeTemplatesWithoutIncomingHostedOnRelationships(topologyTemplate)){
			if (!ModelUtilities.getTargetLabel(node).isPresent()){
				return false;
			}
		}

		for (TNodeTemplate node : transitiveAndDirectSuccessors.keySet()) {
			if (!transitiveAndDirectSuccessors.get(node).isEmpty()){
				for (TNodeTemplate successor : transitiveAndDirectSuccessors.get(node) ){

					if (ModelUtilities.getTargetLabel(successor).isPresent()
						&&!ModelUtilities.getTargetLabel(node).equals(ModelUtilities.getTargetLabel(successor))) {

							return false;
						}


				}
			}
		}
		return true;
	}

	/**
	 * The method splits a topology template according to the attached target labels. The target labels attached to
	 * nodes determine at which target the nodes should be deployed.
	 * The result is a topology template containing for each target the required nodes.
	 *
	 * @param topologyTemplate the topology template which should be split
	 * @return split topologyTemplate
	 */
	public TTopologyTemplate split(TTopologyTemplate topologyTemplate) {
		TTopologyTemplate topologyTemplateCopy = BackendUtils.cloneTopologyTemplate(topologyTemplate);

		HashSet<TNodeTemplate> nodeTemplatesWhichPredecessorsHasNoPredecessors = new HashSet<>(getNodeTemplatesWhichPredecessorsHasNoPredecessors(topologyTemplateCopy));

		while (!nodeTemplatesWhichPredecessorsHasNoPredecessors.isEmpty()){

			for (TNodeTemplate node: nodeTemplatesWhichPredecessorsHasNoPredecessors){
				List<TNodeTemplate> predecessors = getHostedOnPredecessorsOfNodeTemplate(topologyTemplateCopy, node);

				Set<String> predecessorsTargetLabel = new HashSet();
				for (TNodeTemplate predecessor: predecessors){
					predecessorsTargetLabel.add(ModelUtilities.getTargetLabel(predecessor).get());
				}
				if (predecessorsTargetLabel.size() == 1){
					ModelUtilities.setTargetLabel(node, ModelUtilities.getTargetLabel(predecessors.get(0)).get());
				} else {

					List<TRelationshipTemplate> incomingRelationships = ModelUtilities.getIncomingRelationshipTemplates(topologyTemplateCopy, node);
					List<TRelationshipTemplate> outgoingRelationships = ModelUtilities.getOutgoingRelationshipTemplates(topologyTemplateCopy, node);

					for (String targetLabel: predecessorsTargetLabel) {
						TNodeTemplate newNode = BackendUtils.cloneNodeTemplate(node);
						newNode.setId(node.getId() + "-" + targetLabel);
						newNode.setName(node.getName() + "-" + targetLabel);
						topologyTemplate.getNodeTemplateOrRelationshipTemplate().add(newNode);
						topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().add(newNode);
						ModelUtilities.setTargetLabel(newNode, targetLabel);

						for (TRelationshipTemplate outgoingRelationship : outgoingRelationships) {
							TRelationshipTemplate newOutgoingRelationship = BackendUtils.cloneRelationshipTemplate(outgoingRelationship);
							TRelationshipTemplate.SourceElement sourceElementNew = new TRelationshipTemplate.SourceElement();
							sourceElementNew.setRef(newNode);
							newOutgoingRelationship.setSourceElement(sourceElementNew);
							newOutgoingRelationship.setId(outgoingRelationship.getId() + "-" + targetLabel);
							newOutgoingRelationship.setName(outgoingRelationship.getName() + "-" + targetLabel);

							topologyTemplate.getNodeTemplateOrRelationshipTemplate().add(newOutgoingRelationship);
							topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().add(newOutgoingRelationship);
						}

						for (TRelationshipTemplate incomingRelationship : incomingRelationships) {

							Object ref = incomingRelationship.getSourceElement().getRef();

							if (ref instanceof TNodeTemplate
									&& ((ModelUtilities.getTargetLabel((TNodeTemplate) ref).equals(ModelUtilities.getTargetLabel(newNode))
									&& incomingRelationship.getType().getLocalPart().toLowerCase().contains("hostedon"))
									|| !predecessors.contains((TNodeTemplate) ref))) {

								TRelationshipTemplate newIncomingRelationship = BackendUtils.cloneRelationshipTemplate(incomingRelationship);
								TRelationshipTemplate.TargetElement targetElementNew = new TRelationshipTemplate.TargetElement();
								targetElementNew.setRef(newNode);
								newIncomingRelationship.setTargetElement(targetElementNew);
								newIncomingRelationship.setId(incomingRelationship.getId() + "-" + targetLabel);
								newIncomingRelationship.setName(incomingRelationship.getName() + "-" + targetLabel);

								topologyTemplate.getNodeTemplateOrRelationshipTemplate().add(newIncomingRelationship);
								topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().add(newIncomingRelationship);

							}

						}
					}


					topologyTemplate.getNodeTemplateOrRelationshipTemplate().remove(node);
					topologyTemplate.getNodeTemplateOrRelationshipTemplate().removeAll(outgoingRelationships);
					topologyTemplate.getNodeTemplateOrRelationshipTemplate().removeAll(incomingRelationships);
					topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().remove(node);
					topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().removeAll(outgoingRelationships);
					topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().removeAll(incomingRelationships);
				}

				topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().removeAll(predecessors);
				List<TRelationshipTemplate> removingRelationships = ModelUtilities.getAllRelationshipTemplates(topologyTemplateCopy)
						.stream()
						.filter (rt -> rt.getSourceElement().getRef() instanceof TNodeTemplate)
						.filter(rt -> predecessors.contains((TNodeTemplate) rt.getSourceElement().getRef()))
						.collect(Collectors.toList());

				topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().removeAll(removingRelationships);
			}
			nodeTemplatesWhichPredecessorsHasNoPredecessors.clear();
			nodeTemplatesWhichPredecessorsHasNoPredecessors.addAll(getNodeTemplatesWhichPredecessorsHasNoPredecessors(topologyTemplateCopy));
		}

		return topologyTemplate;
	}

	public TTopologyTemplate matching (TTopologyTemplate topologyTemplate){
		List<TNodeTemplate> matching = new ArrayList<>();
		matching.clear();
		List<TNodeTemplate> nodesWithoutHostedOnSuccessors = topologyTemplate.getNodeTemplateOrRelationshipTemplate()
				.stream()
				.filter(x -> x instanceof TNodeTemplate)
				.map(TNodeTemplate.class::cast)
				.filter(y -> !getNodeTemplatesWithoutIncomingHostedOnRelationships(topologyTemplate).contains(y))
				.filter(z -> getNodeTemplatesWithoutOutgoingHostedOnRelationships(topologyTemplate).contains(z))
				.collect(Collectors.toList());

		while (!nodesWithoutHostedOnSuccessors.isEmpty()){
			for (TNodeTemplate replacementCandidate : nodesWithoutHostedOnSuccessors){
				//TODO
			}

		}

		return topologyTemplate;
	}

	/**
	 *
	 * @param topologyTemplate
	 * @return
	 */
	protected List<TNodeTemplate> getNodeTemplatesWithoutIncomingHostedOnRelationships(TTopologyTemplate topologyTemplate) {

		return ModelUtilities.getAllNodeTemplates(topologyTemplate)
				.stream()
				.filter(nt -> getHostedOnPredecessorsOfNodeTemplate(topologyTemplate, nt).isEmpty())
				.collect(Collectors.toList());
			}

	/**
	 *
	 * @param topologyTemplate
	 * @return
	 */
	protected List<TNodeTemplate> getNodeTemplatesWithoutOutgoingHostedOnRelationships(TTopologyTemplate topologyTemplate) {

		return ModelUtilities.getAllNodeTemplates(topologyTemplate)
				.stream()
				.filter(nt -> getHostedOnSuccessorsOfNodeTemplate(topologyTemplate, nt).isEmpty())
				.collect(Collectors.toList());
	}

	/**
	 *
	 * @param topologyTemplate
	 * @param nodeTemplate
	 * @return
	 */
	protected List<TNodeTemplate> getPredecessorsOfNodeTemplate(TTopologyTemplate topologyTemplate, TNodeTemplate nodeTemplate) {
		List<TNodeTemplate> predecessorNodeTemplates = new ArrayList<>();
		for (TRelationshipTemplate relationshipTemplate: ModelUtilities.getIncomingRelationshipTemplates(topologyTemplate, nodeTemplate)){
			if (relationshipTemplate.getSourceElement().getRef() instanceof TNodeTemplate){
				predecessorNodeTemplates.add((TNodeTemplate) relationshipTemplate.getSourceElement().getRef());
			}
		}
		return predecessorNodeTemplates;
	}

	/**
	 *
	 * @param topologyTemplate
	 * @return
	 */
	protected List<TNodeTemplate> getNodeTemplatesWhichPredecessorsHasNoPredecessors(TTopologyTemplate topologyTemplate) {
		List<TNodeTemplate> nodeTemplates = ModelUtilities.getAllNodeTemplates(topologyTemplate);

		List<TNodeTemplate> candidates = new ArrayList<>();
		for (TNodeTemplate nodeTemplate: nodeTemplates){
			List<TNodeTemplate> allPredecessors = getHostedOnPredecessorsOfNodeTemplate(topologyTemplate, nodeTemplate);
			if (!allPredecessors.isEmpty()){
				for (TNodeTemplate predecessor: allPredecessors){
					if(getHostedOnPredecessorsOfNodeTemplate(topologyTemplate, predecessor).isEmpty()){
						candidates.add(nodeTemplate);
					}
				}
			}
		}
		return candidates;
	}

	/**
	 *
	 * @param topologyTemplate
	 * @param nodeTemplate
	 * @return list of successors of the node template. A successor is a node Templates which is the target of a hostedOn Relationship from the node
	 */
	protected List<TNodeTemplate> getHostedOnSuccessorsOfNodeTemplate(TTopologyTemplate topologyTemplate, TNodeTemplate nodeTemplate) {
		List<TNodeTemplate> successorNodeTemplates = new ArrayList<>();
		for (TRelationshipTemplate relationshipTemplate: ModelUtilities.getOutgoingRelationshipTemplates(topologyTemplate, nodeTemplate)){
			if (relationshipTemplate.getTargetElement().getRef() instanceof TNodeTemplate
					&& relationshipTemplate.getType().getLocalPart().toLowerCase().contains("hostedon")){
				successorNodeTemplates.add((TNodeTemplate) relationshipTemplate.getTargetElement().getRef());
			}
		}
		return successorNodeTemplates;
	}

	/**
	 *
	 * @param topologyTemplate
	 * @param nodeTemplate
	 * @return list of predecessors of the node template which has a hostedOn Relationship Template to the nodeTemplate
	 */
	protected List<TNodeTemplate> getHostedOnPredecessorsOfNodeTemplate(TTopologyTemplate topologyTemplate, TNodeTemplate nodeTemplate) {
		List<TNodeTemplate> predecessorNodeTemplates = new ArrayList<>();
		for (TRelationshipTemplate relationshipTemplate: ModelUtilities.getIncomingRelationshipTemplates(topologyTemplate, nodeTemplate)){
			if (relationshipTemplate.getSourceElement().getRef() instanceof TNodeTemplate
					&& relationshipTemplate.getType().getLocalPart().toLowerCase().contains("hostedon")){
				predecessorNodeTemplates.add((TNodeTemplate) relationshipTemplate.getSourceElement().getRef());
			}
		}
		return predecessorNodeTemplates;
	}

	private Map<TNodeTemplate, Set<TNodeTemplate>> initDirectSuccessors = new HashMap<>();
	private Map<TNodeTemplate, Boolean> visitedNodeTemplates = new HashMap<>();
	private Map<TNodeTemplate, Set<TNodeTemplate>> transitiveAndDirectSuccessors = new HashMap<>();

	protected Map<TNodeTemplate, Set<TNodeTemplate>> computeTransitiveClosure (TTopologyTemplate topologyTemplate) {
		List<TNodeTemplate> nodeTemplates = new ArrayList<>(ModelUtilities.getAllNodeTemplates(topologyTemplate));


		for (TNodeTemplate node : nodeTemplates) {
			initDirectSuccessors.put(node, new HashSet<>(getHostedOnSuccessorsOfNodeTemplate(topologyTemplate, node)));
			visitedNodeTemplates.put(node, false);
			transitiveAndDirectSuccessors.put(node, new HashSet<>());
		}
		for (TNodeTemplate node: nodeTemplates){
			if (!visitedNodeTemplates.get(node)){
				computeNodeForTransitiveClosure(node);
			}
		}


		return transitiveAndDirectSuccessors;
	}

	/**
	 *
	 * @param nodeTemplate
	 * @return
	 */
	private void computeNodeForTransitiveClosure (TNodeTemplate nodeTemplate){
		visitedNodeTemplates.put(nodeTemplate, true);
		Set<TNodeTemplate> successorsToCheck;
		successorsToCheck = initDirectSuccessors.get(nodeTemplate);
		successorsToCheck.removeAll(transitiveAndDirectSuccessors.get(nodeTemplate));

		for (TNodeTemplate successorToCheck : successorsToCheck ){
			if (!visitedNodeTemplates.get(successorToCheck)){
				computeNodeForTransitiveClosure(successorToCheck);
			}
			transitiveAndDirectSuccessors.get(nodeTemplate).add(successorToCheck);
			transitiveAndDirectSuccessors.get(nodeTemplate).addAll(transitiveAndDirectSuccessors.get(successorToCheck));
		}
	}
}
