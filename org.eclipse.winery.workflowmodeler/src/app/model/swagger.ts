/*******************************************************************************
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 *******************************************************************************/

export class SwaggerReference {
	public $ref: string;

	constructor({ $ref }) {
		this.$ref = $ref;
	}
}

export class SwaggerItems {
	public collectionFormat: string;
	public defaultValue:  any;
	public enumValues: any[];
	public exclusiveMaximum: boolean;
	public exclusiveMinimum: boolean;
	public format: string;
	public items: SwaggerReference; // Required if type is "array". Describes the type of items in the array.
	public maximum: number;
	public maxItems: number;
	public maxLength: number;
	public minimum: number;
	public minItems: number;
	public minLength:number;
	public multipleOf: number;
	public pattern: string;
	public type: string;
	public uniqueItems: number;

	constructor(options: any) {
		this.collectionFormat = options.collectionFormat;
		this.defaultValue = options.default;
		this.enumValues = options.enum;
		this.exclusiveMaximum = options.exclusiveMaximum;
		this.exclusiveMinimum = options.exclusiveMinimum;
		this.format = options.format;
		if(options.type === "array") {
			this.items = new SwaggerReference(options.items);
		}
		this.maximum = options.maximum;
		this.maxItems = options.maxItems;
		this.maxLength = options.maxLength;
		this.minimum = options.minimum;
		this.minItems = options.minItems;
		this.minLength = options.minLength;
		this.multipleOf = options.multipleOf;
		this.pattern = options.pattern;
		this.type = options.type;
		this.uniqueItems = options.uniqueItems;
	}
}

export class SwaggerParameter extends SwaggerItems {
	public description: string;
	public position: string;  // in path, query, header, body, form
	public name: string;
	public required: boolean;

	// if position is body
	public schema: SwaggerReference;

	constructor(options:any) {
		super(options);

		this.description = options.description;
		this.position = options.in;
		this.name = options.name;
		this.required = options.required;
		if(this.position === "body") {
			this.schema = new SwaggerReference(options.schema);
		}
	}
}
export class SwaggerSchema {
	public type: string;
	public items: SwaggerReference;
	public $ref: string;

	constructor({ type, $ref, items }) {
		this.type = type;
		this.$ref = $ref;
		if(items) {
			this.items = new SwaggerReference(items);
		}
	}
}

export class SwaggerHeader extends SwaggerItems {
	public description: string;

	constructor(options: any) {
		super(options);
		this.description = options.description;
	}
}

export class SwaggerHeaders  {
	public headerObj: any = {};

	constructor(options: Object) {
		for(let key in options) {
			this.headerObj[key] = new SwaggerHeader(options[key]);
		}
	}

}

export class SwaggerResponse {
	public description: string;
	public schema: SwaggerSchema;
	public headers: SwaggerHeaders;

	constructor({description, schema, headers}) {
		this.description = description;

		if(schema) {
			this.schema = new SwaggerSchema(schema);
		}

		if(headers) {
			this.headers = new SwaggerHeaders(headers);
		}
	}
}

export class SwaggerResponses {
	public responseObj: any = {};

	constructor(options: any) {
		for(let key in options) {
			this.responseObj[key] = new SwaggerResponse(options[key]);
		}
	}
}


export class SwaggerMethod {
	public consumes: string[];
	public description: string;
	public operationId: string;
	public parameters: SwaggerParameter[];
	public produces: string[];
	public responses: SwaggerResponses;
	public summary: string;
	public tags: string[];

	constructor({consumes, description, operationId, parameters, produces, responses, summary, tags,}) {
		this.consumes = consumes;
		this.description = description;
		this.operationId = operationId;
		this.parameters = parameters.map(param => new SwaggerParameter(param));
		this.produces = produces;
		this.responses = new SwaggerResponses(responses);
		this.summary = summary;
		this.tags = tags;
	}
}

export class SwaggerPath {
	public methodObj: any = {};

	constructor(options:any) {
		for(let key in options) {
			this.methodObj[key] = new SwaggerMethod(options[key]);
		}
	}
}

export class SwaggerInfo {
	public title: string;
	public version: string;

	constructor({ title, version, }) {
		this.title = title;
		this.version = version;
	}
}

export class SwaggerTag {
	public name: string;

	constructor({name}) {
		this.name = name;
	}
}

export class SwaggerPaths {
	public paths: any = {};

	constructor(options: any) {
		for(let key in options) {
			this.paths[key] = new SwaggerPath(options[key]);
		}

	}

}

export class SwaggerDefinitionProperties {
	public propertiesObj = {};

	constructor(options: any) {
		for(let key in options) {
			this.propertiesObj[key] = new SwaggerItems(options[key]);
		}
	}
}

export class SwaggerDefinition {
	public type: string;
	public properties: SwaggerDefinitionProperties;
	public required: string[];

	constructor({ type, properties, required}) {
		this.type = type;
		this.properties = new SwaggerDefinitionProperties(properties);
		this.required = required;
	}
}


export class SwaggerDefinitions {
	public definitionObj: any = {};

	constructor (options: Object) {
		for(let key in options) {
			this.definitionObj[key] = new SwaggerDefinition(options[key]);
		}
	}
}

export class Swagger {
	public basePath: string;
	public definitions: SwaggerDefinitions;
	public info: SwaggerInfo;
	public paths: SwaggerPaths;
	public swagger: string;
	public tags: SwaggerTag[];

	constructor({basePath, definitions, info, paths, swagger, tags}) {
		this.basePath = basePath;
		this.definitions = new SwaggerDefinitions(definitions);
		this.info = new SwaggerInfo(info);
		this.paths = new SwaggerPaths(paths);
		this.swagger = swagger;
		this.tags = tags.map(tag => new SwaggerTag(tag));
	}
}
