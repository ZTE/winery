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

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.xml.namespace.QName;

import org.eclipse.winery.common.ids.Namespace;
import org.eclipse.winery.common.ids.definitions.RequirementTypeId;
import org.eclipse.winery.common.ids.definitions.ServiceTemplateId;
import org.eclipse.winery.model.tosca.TNodeTemplate;
import org.eclipse.winery.model.tosca.TRequirement;
import org.eclipse.winery.repository.backend.Repository;
import org.eclipse.winery.repository.resources.AbstractComponentsResource;
import org.eclipse.winery.repository.resources.entitytypes.requirementtypes.RequirementTypeResource;
import org.eclipse.winery.repository.resources.servicetemplates.ServiceTemplateResource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ProviderRepository {
	private static final Logger LOGGER = LoggerFactory.getLogger(ProviderRepository.class);

	public static final ProviderRepository INSTANCE = new ProviderRepository();

	private static final Map<String, Namespace> targetLocationToNamespaceMap = new HashMap<>();
	static {
		targetLocationToNamespaceMap.put("AmazonPaaS", new Namespace("http://www.opentosca.org/providers/amazon/paas", false));
		targetLocationToNamespaceMap.put("OnPremiseIAAS", new Namespace("http://www.opentosca.org/providers/IAAS/", false)); // Alternative namespace: http://www.iaas.uni-stuttgart.de/onpremise
		targetLocationToNamespaceMap.put("OnPremiseIPVS", new Namespace("http://www.opentosca.org/providers/IPVS/", false));
	}

	/**
	 * TODO: This implements a collection of node templates only. One could also point directly to a certain node tempalte.
	 *       Current workaround: Create a service template in a separeate namespace containing a single node template only
	 *
	 * @return All node templates available for the given targetLocation
	 */
	public List<TNodeTemplate> getAllNodeTemplatesForLocation(String targetLocation) {
		Namespace namespace = targetLocationToNamespaceMap.get(targetLocation);
		if (namespace == null) {
			LOGGER.info("unknown targetLocation " + targetLocation);
			return Collections.emptyList();
		}
		return Repository.INSTANCE.getAllTOSCAComponentIds(ServiceTemplateId.class).stream()
				// get all service templates in the namespace
				.filter(id -> id.getNamespace().equals(namespace))
				// get all contained node templates
				.flatMap(id -> {
					ServiceTemplateResource serviceTemplateResource = (ServiceTemplateResource) AbstractComponentsResource.getComponentInstaceResource(id);
					return serviceTemplateResource.getServiceTemplate().getTopologyTemplate().getNodeTemplateOrRelationshipTemplate().stream()
							.filter(t -> t instanceof TNodeTemplate)
							.map(TNodeTemplate.class::cast);
				})
				.collect(Collectors.toList());
	}

	/**
	 * @return All node templates available for the given targetLocation
	 */
	public List<TNodeTemplate> getAllNodeTemplatesForLocationAndOfferingCapability(String targetLocation, List <TRequirement> requirements) {
		QName reqTypeQName = requirements.get(0).getType();
		RequirementTypeId reqTypeId = new RequirementTypeId(reqTypeQName);
		RequirementTypeResource reqTypeResource = (RequirementTypeResource) AbstractComponentsResource.getComponentInstaceResource(reqTypeId);
		QName requiredCapabilityType = reqTypeResource.getRequirementType().getRequiredCapabilityType();

		return this.getAllNodeTemplatesForLocation(targetLocation).stream()
				.filter(nt -> nt.getCapabilities() != null)
				.filter(nt -> nt.getCapabilities().getCapability().stream()
						.anyMatch(cap -> cap.getType().equals(requiredCapabilityType))
				).collect(Collectors.toList());
	}

}
