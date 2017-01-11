package org.eclipse.winery.repository.splitting;

import org.eclipse.winery.common.ModelUtilities;
import org.eclipse.winery.model.tosca.TNodeTemplate;
import org.eclipse.winery.model.tosca.TRelationshipTemplate;
import org.eclipse.winery.model.tosca.TTopologyTemplate;
import org.eclipse.winery.repository.backend.BackendUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class Splitting {
	
	/**
	 * The method checks if a topology template is valid. The topology is valid if all successor nodes which are
	 * connected by hostedOn relationships have no other target assigned
	 * 
	 * @param topologyTemplate the topology template which should be checked
	 * @return true if the topology template is valid
	 */
	public boolean checkValidTopology (TTopologyTemplate topologyTemplate){
		Map<TNodeTemplate, Set<TNodeTemplate>> transitiveAndDirectSuccessors = new HashMap<>();
		transitiveAndDirectSuccessors = computeTransitiveClosure(topologyTemplate);

		for (TNodeTemplate node : transitiveAndDirectSuccessors.keySet()) {
			if (!transitiveAndDirectSuccessors.get(node).isEmpty()){
				for (TNodeTemplate successor : transitiveAndDirectSuccessors.get(node) ){
								
					if (ModelUtilities.getTargetLabel(successor).get() == null){
						if (!ModelUtilities.getTargetLabel(node).equals(ModelUtilities.getTargetLabel(successor))) {
							System.out.println(node.getName() + "Target: " + ModelUtilities.getTargetLabel(node));
							System.out.println(successor.getName() + "Target: " + ModelUtilities.getTargetLabel(successor));
							return false;
						}
					}
					
				}
					
			}
			
		}
		return true;
		
		/*return transitiveAndDirectSuccessors.entrySet()
				.stream()
				.anyMatch(x -> x.getValue().stream()
						.anyMatch(y -> !ModelUtilities.getTargetLabel(y).equals(null) 
								&& !ModelUtilities.getTargetLabel(y).equals(ModelUtilities.getTargetLabel(x.getKey()))));*/
		
		//TODO iterrieren über Hasmap und dann für jede Node prüfen (key) die Menge an Nachfolgern prüfen (value) ob da eine Node dabei ist, die ein anderes Target hat
		
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
		TTopologyTemplate topologyTemplateCopy = BackendUtils.clone(topologyTemplate);
	
		HashSet<TNodeTemplate> nodeTemplatesWhichPredecessorsHasNoPredecessors = new HashSet<>(getNodeTemplatesWhichPredecessorsHasNoPredecessors(topologyTemplateCopy));
		
		while (!nodeTemplatesWhichPredecessorsHasNoPredecessors.isEmpty()){
			for (TNodeTemplate node: nodeTemplatesWhichPredecessorsHasNoPredecessors){
				List<TNodeTemplate> predecessors = getPredecessorsOfNodeTemplate(topologyTemplateCopy, node);
				Set<String> precedessorsTargetLabel = new HashSet();
				for (TNodeTemplate predecessor: predecessors){
					precedessorsTargetLabel.add(ModelUtilities.getTargetLabel(predecessor).get());
				}
				if (precedessorsTargetLabel.size() == 1){
					ModelUtilities.setTargetLabel(node, precedessorsTargetLabel.iterator().next());
				} else {
					
					List<TRelationshipTemplate> incomingRelationships = ModelUtilities.getIncomingRelationshipTemplates(topologyTemplateCopy, node);
					List<TRelationshipTemplate> outgoingRelationships = ModelUtilities.getOutgoingRelationshipTemplates(topologyTemplateCopy, node);
					
					for (String targetLabel: precedessorsTargetLabel) {
						TNodeTemplate newNode = BackendUtils.clone(node);
						newNode.setId(node.getId() + "-" + targetLabel);
						newNode.setName(node.getName() + "-" + targetLabel);
						topologyTemplate.getNodeTemplateOrRelationshipTemplate().add(newNode);
						topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().add(newNode);
						ModelUtilities.setTargetLabel(newNode, targetLabel);
											
						for (TRelationshipTemplate outgoingRelationship : outgoingRelationships) {
							TRelationshipTemplate newOutgoingRelationship = BackendUtils.clone(outgoingRelationship);
							newOutgoingRelationship.getSourceElement().setRef(newNode);
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
								
								TRelationshipTemplate newIncomingRelationship = BackendUtils.clone(incomingRelationship);
								newIncomingRelationship.getTargetElement().setRef(newNode);
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
						.filter(rt -> predecessors.contains(rt.getSourceElement().getRef()))
						.collect(Collectors.toList());
				topologyTemplateCopy.getNodeTemplateOrRelationshipTemplate().removeAll(removingRelationships);
			}
			nodeTemplatesWhichPredecessorsHasNoPredecessors.addAll(getNodeTemplatesWhichPredecessorsHasNoPredecessors(topologyTemplateCopy));
			
		}

		return topologyTemplate;
	}

	/**
	 * 
	 * @param topologyTemplate
	 * @return
	 */
	protected List<TNodeTemplate> getNodeTemplatesWithoutIncomingEdges(TTopologyTemplate topologyTemplate) {
		return ModelUtilities.getAllNodeTemplates(topologyTemplate)
                    .stream()
                    .filter(nt -> ModelUtilities.getIncomingRelationshipTemplates(topologyTemplate, nt).isEmpty())
                    .collect(Collectors.toList());
	}
	//Hier muss noch gefiltert werden über die hostedOn beziehungen - es sollen nur die Vorgänger zurückgegeben werden, die eine hostedOn Beziehung zu der Node haben

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

	/**
	 * 
	 * @param topologyTemplate
	 * @param nodeTemplate
	 * @return list of successors of the node template. A successor is a node Templates which is the target of a hostedOn Relationship from the node
	 */
	protected List<TNodeTemplate> getSuccessorsOfNodeTemplate(TTopologyTemplate topologyTemplate, TNodeTemplate nodeTemplate) {
		List<TNodeTemplate> successorNodeTemplates = new ArrayList<>();
		for (TRelationshipTemplate relationshipTemplate: ModelUtilities.getOutgoingRelationshipTemplates(topologyTemplate, nodeTemplate)){
			if (relationshipTemplate.getSourceElement().getRef() instanceof TNodeTemplate 
					&& relationshipTemplate.getType().getLocalPart().toLowerCase().contains("hostedon")){
				successorNodeTemplates.add((TNodeTemplate) relationshipTemplate.getTargetElement().getRef());
			}
		}
		return successorNodeTemplates;
	}

	private Map<TNodeTemplate, Set<TNodeTemplate>> initDirectSuccessors = new HashMap<>();
	private Map<TNodeTemplate, Boolean> visitedNodeTemplates = new HashMap<>();
	private Map<TNodeTemplate, Set<TNodeTemplate>> transitiveAndDirectSuccessors = new HashMap<>();
	
	protected Map<TNodeTemplate, Set<TNodeTemplate>> computeTransitiveClosure (TTopologyTemplate topologyTemplate) {
		List<TNodeTemplate> nodeTemplates = new ArrayList<>(ModelUtilities.getAllNodeTemplates(topologyTemplate));
		
		
		for (TNodeTemplate node : nodeTemplates) {
			initDirectSuccessors.put(node, new HashSet<>(getSuccessorsOfNodeTemplate(topologyTemplate, node)));
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
