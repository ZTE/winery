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
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.eclipse.winery.common.ModelUtilities;
import org.eclipse.winery.common.ids.definitions.ServiceTemplateId;
import org.eclipse.winery.model.tosca.TNodeTemplate;
import org.eclipse.winery.model.tosca.TRelationshipTemplate;
import org.eclipse.winery.model.tosca.TTopologyTemplate;
import org.eclipse.winery.repository.backend.Repository;
import org.eclipse.winery.repository.resources.AbstractComponentsResource;
import org.eclipse.winery.repository.resources.servicetemplates.ServiceTemplateResource;

public class Splitting {

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

		TTopologyTemplate newTopologyTemplate = serviceTempateResource.getServiceTemplate().getTopologyTemplate();
		newServiceTempateResource.getServiceTemplate().setTopologyTemplate(newTopologyTemplate);
		newServiceTempateResource.persist();
		return newServiceTemplateId;
	}

	/**
	 * stub - will be replaced by split2
	 */
	public TTopologyTemplate split(TTopologyTemplate topologyTemplate) {
		return topologyTemplate;
	}

	/**
	 * The method splits a topology template according to the attached target labels. The target labels attached to
	 * nodes determine at which target the nodes should be deployed.
	 * The result is a topology template containing for each target the required nodes.
	 * 
	 * @param topologyTemplate the topology template which should be split
	 * @return split topologyTemplate
	 */
	public TTopologyTemplate split2(TTopologyTemplate topologyTemplate) {
		//How to clone an object?
		TTopologyTemplate topologyTemplateCopy = new TTopologyTemplate();
		//IST DAS DIE EINZIGE MÖGLICHKEIT ZU KOPIEREN?
		topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().addAll(topologyTemplate.getNodeTemplateOrRelationshipTemplate());
		HashSet<TNodeTemplate> nodeTemplatesWhichPredecessorsHasNoPredecessors = new HashSet<>(getNodeTemplatesWhichPredecessorsHasNoPredecessors(topologyTemplateCopy));
		
		while (!nodeTemplatesWhichPredecessorsHasNoPredecessors.isEmpty()){
			for (TNodeTemplate node: nodeTemplatesWhichPredecessorsHasNoPredecessors){
				List<TNodeTemplate> predecessors = getPredecessorsOfNodeTemplate(topologyTemplateCopy, node);
				HashSet<String> precedessorsLocations = new HashSet();
				for (TNodeTemplate predecessor: predecessors){
					//Problerm mit Optional Rückgabewert - muss ich dann ne if empty abfrage vorher machen bevor ich adden kann?
					// FIXME: compile error: precedessorsLocations.add(ModelUtilities.getTarget(predecessor));
				}
				if (precedessorsLocations.size() == 1){
					ModelUtilities.setTarget(node, precedessorsLocations.iterator().next());
				} else {
					
					List<TRelationshipTemplate> incomingRelationships = ModelUtilities.getIncomingRelationshipTemplates(topologyTemplateCopy, node);
					List<TRelationshipTemplate> outgoingRelationships = ModelUtilities.getOutgoingRelationshipTemplates(topologyTemplateCopy, node);
					
					for (String target: precedessorsLocations) {
						//How to clone an object?
						TNodeTemplate newNode = new TNodeTemplate();
						newNode.setId(node.getId());
						topologyTemplate.getNodeTemplateOrRelationshipTemplate().add(newNode);
						topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().add(newNode);
						ModelUtilities.setTarget(newNode, target);

						//Kann ich irgendwie über den Relationship Type abfragen ob es eine hostedOn oder eine ConnectsTo beziehung ist?
						//Brauch ich um die richtigen eingehendenKanten zu finden, um nur die umzusetzten auf newNode
						
						for (TRelationshipTemplate outgoingRelationship : outgoingRelationships) {
							TRelationshipTemplate newOutgoingRelationship = new TRelationshipTemplate();
							newOutgoingRelationship.setTargetElement(outgoingRelationship.getTargetElement());
							newOutgoingRelationship.getSourceElement().setRef(newNode);
							topologyTemplate.getNodeTemplateOrRelationshipTemplate().add(newOutgoingRelationship);
							topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().add(newOutgoingRelationship);
							//Wie kann ich eine neue Id dafür generieren? Die muss ja eindeutig sein
						}

						for (TRelationshipTemplate incomingRelationship : incomingRelationships) {
							if (ModelUtilities.getTarget((TNodeTemplate) incomingRelationship.getSourceElement().getRef()).equals(ModelUtilities.getTarget(newNode))) {
								TRelationshipTemplate newIncomingRelationship = new TRelationshipTemplate();
								newIncomingRelationship.setSourceElement(incomingRelationship.getSourceElement());
								newIncomingRelationship.getTargetElement().setRef(newNode);
								topologyTemplate.getNodeTemplateOrRelationshipTemplate().add(newIncomingRelationship);
								topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().add(newIncomingRelationship);
							}
							//if (ist eine connectsto Beziehung) {...}

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
				List<TRelationshipTemplate> removingRelationships = (List<TRelationshipTemplate>) topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate()
						.stream()
						.filter(x -> x instanceof TRelationshipTemplate)
						.map (TRelationshipTemplate.class::cast)
						.filter(rt -> predecessors.contains((TNodeTemplate) rt.getSourceElement().getRef()));
				topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().removeAll(removingRelationships);
			}
			nodeTemplatesWhichPredecessorsHasNoPredecessors.addAll(getNodeTemplatesWhichPredecessorsHasNoPredecessors(topologyTemplateCopy));
			
		}

		return topologyTemplate;
	}

	protected List<TNodeTemplate> getNodeTemplatesWithoutIncomingEdges(TTopologyTemplate topologyTemplate) {
		return topologyTemplate.getNodeTemplateOrRelationshipTemplate()
                    .stream()
                    .filter(x -> x instanceof TNodeTemplate)
                    .map(TNodeTemplate.class::cast)
                    .filter(nt -> ModelUtilities.getIncomingRelationshipTemplates(topologyTemplate, nt).isEmpty())
                    .collect(Collectors.toList());
	}
	
	protected List<TNodeTemplate> getPredecessorsOfNodeTemplate(TTopologyTemplate topologyTemplate, TNodeTemplate nodeTemplate) {
		List<TNodeTemplate> predecessorNodeTemplates = new ArrayList<>();
		for (TRelationshipTemplate relationshipTemplate: ModelUtilities.getIncomingRelationshipTemplates(topologyTemplate, nodeTemplate)){
				if (relationshipTemplate.getSourceElement().getRef() instanceof TNodeTemplate){
					predecessorNodeTemplates.add((TNodeTemplate) relationshipTemplate.getSourceElement().getRef());
				}
		}
		return predecessorNodeTemplates;
	}

	protected List<TNodeTemplate> getNodeTemplatesWhichPredecessorsHasNoPredecessors(TTopologyTemplate topologyTemplate) {
		List<TNodeTemplate> nodeTemplates = topologyTemplate.getNodeTemplateOrRelationshipTemplate()
				.stream()
				.filter(x -> x instanceof TNodeTemplate)
				.map(TNodeTemplate.class::cast)
				.collect(Collectors.toList());

		List<TNodeTemplate> predecessors = new ArrayList<>();
		for (TNodeTemplate nodeTemplate: nodeTemplates){
			if (getPredecessorsOfNodeTemplate(topologyTemplate, nodeTemplate) != null){
				for (TNodeTemplate predecessor: getPredecessorsOfNodeTemplate(topologyTemplate, nodeTemplate)){
					predecessors.add(predecessor);
				}
			}
		}
		return predecessors
				.stream()
				.filter(x -> getPredecessorsOfNodeTemplate(topologyTemplate, x).isEmpty())
				.collect(Collectors.toList());
	}

}
