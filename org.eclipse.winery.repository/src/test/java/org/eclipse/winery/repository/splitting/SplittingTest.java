package org.eclipse.winery.repository.splitting;

import org.eclipse.winery.common.ModelUtilities;
import org.eclipse.winery.common.ids.definitions.ServiceTemplateId;
import org.eclipse.winery.model.tosca.TEntityTemplate;
import org.eclipse.winery.model.tosca.TNodeTemplate;
import org.eclipse.winery.model.tosca.TRelationshipTemplate;
import org.eclipse.winery.model.tosca.TTopologyTemplate;
import org.eclipse.winery.repository.Prefs;
import org.eclipse.winery.repository.backend.Repository;
import org.eclipse.winery.repository.resources.servicetemplates.ServiceTemplateResource;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.junit.Assert.*;

public class SplittingTest {

	private Splitting splitting = new Splitting();
	private TTopologyTemplate topologyTemplate;

	@Before
	public void initialize() throws Exception {
		ServiceTemplateId id = new ServiceTemplateId("http://www.example.org", "ST", false);

		// initialize the repo for testing
		new Prefs(true);

		assertTrue(Repository.INSTANCE.exists(id));

		ServiceTemplateResource res = new ServiceTemplateResource(id);
		topologyTemplate = res.getServiceTemplate().getTopologyTemplate();
	}

	@Test
	public void getNodeTemplatesWithoutIncomingEdges() throws Exception {
		TTopologyTemplate topologyTemplate = new TTopologyTemplate();

		TNodeTemplate nt1 = new TNodeTemplate();
		TNodeTemplate nt2 = new TNodeTemplate();
		TNodeTemplate nt3 = new TNodeTemplate();

		TRelationshipTemplate rt = new TRelationshipTemplate();
		TRelationshipTemplate.TargetElement targetElement = new TRelationshipTemplate.TargetElement();
		targetElement.setRef(nt2);
		rt.setTargetElement(targetElement);
		TRelationshipTemplate.SourceElement sourceElement = new TRelationshipTemplate.SourceElement();
		sourceElement.setRef(nt1);
		rt.setSourceElement(sourceElement);

		TRelationshipTemplate rt2 = new TRelationshipTemplate();
		TRelationshipTemplate.TargetElement targetElement1 = new TRelationshipTemplate.TargetElement();
		targetElement1.setRef(nt1);
		rt2.setTargetElement(targetElement1);
		TRelationshipTemplate.SourceElement sourceElement1 = new TRelationshipTemplate.SourceElement();
		sourceElement1.setRef(nt3);
		rt2.setSourceElement(sourceElement1);

		List<TEntityTemplate> entityTemplates = topologyTemplate.getNodeTemplateOrRelationshipTemplate();
		entityTemplates.add(nt1);
		entityTemplates.add(nt2);
		entityTemplates.add(nt3);
		entityTemplates.add(rt);

		List<TNodeTemplate> nodeTemplatesWithoutIncomingEdges = splitting.getNodeTemplatesWithoutIncomingEdges(topologyTemplate);
		assertEquals(Collections.singletonList(nt3), nodeTemplatesWithoutIncomingEdges);
	}
	
	@Test
	public void st1HasTwoNodeTemplatesWithoutIncomingReltationshipTemplate() throws Exception {
		List<String> expectedIds = Arrays.asList("NT1", "NT1_3");
		List<TNodeTemplate> expectedNodeTemplates = topologyTemplate.getNodeTemplateOrRelationshipTemplate().stream()
				.filter(x -> x instanceof TNodeTemplate)
				.map(TNodeTemplate.class::cast)
				.filter(nt -> expectedIds.contains(nt.getId()))
				.collect(Collectors.toList());


		List<TNodeTemplate> nodeTemplatesWithoutIncomingEdges = splitting.getNodeTemplatesWithoutIncomingEdges(topologyTemplate);
		assertEquals(expectedNodeTemplates, nodeTemplatesWithoutIncomingEdges);
	}

	@Test
	public void st1nt1HasCorrectLocationAttribute() throws Exception {
		TNodeTemplate nt1 = topologyTemplate.getNodeTemplateOrRelationshipTemplate()
				.stream()
				.filter(x -> x instanceof TNodeTemplate)
				.map(TNodeTemplate.class::cast)
				.filter(nt -> nt.getId().equals("NT1"))
				.findAny()
				.get();

		Optional<String> location = ModelUtilities.getTarget(nt1);
		assertEquals(Optional.of("l1"), location);
	}

	@Test
	public void st1nt2IsTheNodeTemplateWhichPredecessorsHasNoPredecessors() throws Exception {
		TTopologyTemplate topologyTemplate = new TTopologyTemplate();

		TNodeTemplate nt1 = new TNodeTemplate();
		TNodeTemplate nt2 = new TNodeTemplate();
		TNodeTemplate nt3 = new TNodeTemplate();
		nt1.setId("NT1");
		nt2.setId("NT2");
		nt3.setId("NT3");

		TRelationshipTemplate rt = new TRelationshipTemplate();
		TRelationshipTemplate.TargetElement targetElement = new TRelationshipTemplate.TargetElement();
		targetElement.setRef(nt2);
		rt.setTargetElement(targetElement);
		TRelationshipTemplate.SourceElement sourceElement = new TRelationshipTemplate.SourceElement();
		sourceElement.setRef(nt1);
		rt.setSourceElement(sourceElement);

		TRelationshipTemplate rt2 = new TRelationshipTemplate();
		TRelationshipTemplate.TargetElement targetElement1 = new TRelationshipTemplate.TargetElement();
		targetElement1.setRef(nt1);
		rt2.setTargetElement(targetElement1);
		TRelationshipTemplate.SourceElement sourceElement1 = new TRelationshipTemplate.SourceElement();
		sourceElement1.setRef(nt3);
		rt2.setSourceElement(sourceElement1);

		List<TEntityTemplate> entityTemplates = topologyTemplate.getNodeTemplateOrRelationshipTemplate();
		entityTemplates.add(nt1);
		entityTemplates.add(nt2);
		entityTemplates.add(nt3);
		entityTemplates.add(rt);
		List<TNodeTemplate> expectedNodeTemplates = new ArrayList<>();
		expectedNodeTemplates.add(nt1);
		assertEquals(expectedNodeTemplates, splitting.getNodeTemplatesWhichPredecessorsHasNoPredecessors(topologyTemplate));
	}

}
