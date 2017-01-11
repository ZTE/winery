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

import org.eclipse.winery.model.tosca.TCapability;
import org.eclipse.winery.model.tosca.TNodeTemplate;
import org.eclipse.winery.repository.backend.query.Query;

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
	public List<TNodeTemplate> getAllNodeTemplatesForLocationAndOfferingCapability(String targetLocation, TCapability capability) {
		List<TNodeTemplate> allNodeTemplatesForLocation = this.getAllNodeTemplatesForLocation(targetLocation);
		List<QName> allNodeTypesOfferingCapability = Query.INSTANCE.getAllNodeTypesOfferingCapability(capability)
				.stream()
				.map(t -> new QName(t.getTargetNamespace(), t.getName()) )
				.collect(Collectors.toList());
		List<TNodeTemplate> result = allNodeTemplatesForLocation.stream().filter(nt -> allNodeTypesOfferingCapability.contains(nt.getType())).collect(Collectors.toList());
		return result;
	}

}
