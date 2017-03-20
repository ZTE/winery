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

import $ = require('jquery');
import {BroadcastService} from "./broadcast.service";
import {Injectable} from '@angular/core';
import {ModelService} from "./model.service";
import {WorkflowNode} from '../model/workflow.node';

@Injectable()
export class JsPlumbService {

    jsplumbInstance:any;

    constructor(private broadcastService:BroadcastService,
                private modelService:ModelService) {
    }

    connectNode() {
        this.modelService.getNodes().forEach(node =>
            node.connection.forEach(target =>
                this.jsplumbInstance.connect({source: node.id, target: target})
            )
        );
    }

    initJsPlumbInstance() {
        console.log("init jsplumb instance start")
        let jsPlumb = require('../assets/jslib/jsplumb/index').jsPlumb;
        let _this = this;

        jsPlumb.ready(() => {
            _this.jsplumbInstance = jsPlumb.getInstance();

            _this.jsplumbInstance.importDefaults({
                Anchor: ["Top", "RightMiddle", "LeftMiddle", "Bottom"],
                Connector: [
                    "Flowchart",
                    {cornerRadius: 0, stub: 0, gap: 3}
                ],
                ConnectionOverlays: [
                    [
                        "Arrow",
                        {direction: 1, foldback: 1, location: 1, width: 10, length: 10}
                    ],
                    ["Label", {label: "", id: "label", cssClass: "aLabel"}]
                ],
                connectorPaintStyle: {
                    lineWidth: 2
                },
                Endpoint: "Blank",
                PaintStyle: {lineWidth: 1}
            });

            _this.broadcastService.broadcast(_this.broadcastService.jsPlumbInstance, _this.jsplumbInstance);

            // add connection to model data while a new connection is build
            _this.jsplumbInstance.bind("connection", function (info, originalEvent) {
                _this.modelService.addConnection(info.connection.sourceId, info.connection.targetId);

                info.connection.bind("click", function (connection) {
                    _this.modelService.deleteConnection(connection.sourceId, connection.targetId);
                    jsPlumb.detach(connection);
                });
            });
        });
    }

    initNode(node:WorkflowNode) {

        this.jsplumbInstance.draggable(node.id, {
            start: function (event, ui) {
            },
            stop: function (event) {
                node.position.left = event.pos[0];
                node.position.top = event.pos[1];
            }
        });

        this.jsplumbInstance.makeTarget(node.id, {
            detachable: false,
            isTarget: true,
            maxConnections: -1,
        });

        this.jsplumbInstance.makeSource(node.id, {
            filter: ".anchor, .anchor *",
            detachable: false,
            isSource: true,
            maxConnections: -1,
        });

    }

    /**
     * set each button in toolbar draggable
     */
    buttonDraggable() {
        this.jsplumbInstance.draggable($(".toolbar .item"),
            {
                scope: "btn",
                clone: true
            });
    }

    buttonDroppable() {
        let _this = this;
        this.jsplumbInstance.droppable($(".canvas"), {
            scope: "btn",
            drop: function (ev) {
                let type = $(ev.drag.el).attr("nodeType");
                let left = ev.e.clientX - ev.drop.position[0];
                let top = ev.e.clientY - ev.drop.position[1];

                _this.modelService.addNode(type, type, left, top);
            }
        });
    }

    remove(nodeId:string) {
        this.jsplumbInstance.remove(nodeId);
    }

}