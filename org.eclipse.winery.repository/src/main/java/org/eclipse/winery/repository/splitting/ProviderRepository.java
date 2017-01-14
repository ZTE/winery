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
import java.util.List;
import java.util.stream.Collectors;

import javax.xml.namespace.QName;

import org.eclipse.winery.common.ids.definitions.RequirementTypeId;
import org.eclipse.winery.model.tosca.TCapability;
import org.eclipse.winery.model.tosca.TNodeTemplate;
import org.eclipse.winery.model.tosca.TRequirement;
import org.eclipse.winery.repository.backend.query.Query;
import org.eclipse.winery.repository.resources.AbstractComponentsResource;
import org.eclipse.winery.repository.resources.entitytypes.requirementtypes.RequirementTypeResource;

public class ProviderRepository {

	public static final ProviderRepository INSTANCE = new ProviderRepository();

	/**
	 * @return All node templates available for the given targetLocation
	 */
	public List<TNodeTemplate> getAllNodeTemplatesForLocation(String targetLocation) {
		return Collections.emptyList();
	}

	/**
	 * @return All node templates available for the given targetLocation
	 */
	public List<TNodeTemplate> getAllNodeTemplatesForLocationAndOfferingCapability(String targetLocation, List <TRequirement> requirements) {

		QName reqTypeQName = matchingNodeTemplates.get(0).getRequirements().getRequirement().get(0).getType();
		RequirementTypeId reqTypeId = new RequirementTypeId(reqTypeQName);
		RequirementTypeResource reqTypeResource = (RequirementTypeResource) AbstractComponentsResource.getComponentInstaceResource(reqTypeId);
		reqTypeResource.getRequirementType().getRequiredCapabilityType();

		List<TNodeTemplate> allNodeTemplatesForLocation = this.getAllNodeTemplatesForLocation(targetLocation);
		List<QName> allNodeTypesOfferingCapability = Query.INSTANCE.getAllNodeTypesOfferingCapability(requirements)
				.stream()
				.map(t -> new QName(t.getTargetNamespace(), t.getName()) )
				.collect(Collectors.toList());
		List<TNodeTemplate> result = allNodeTemplatesForLocation.stream().filter(nt -> allNodeTypesOfferingCapability.contains(nt.getType())).collect(Collectors.toList());
		return result;
	}

}
