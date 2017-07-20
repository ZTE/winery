/**
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */

import { Injectable } from '@angular/core';
import * as jsp from 'jsplumb';

import { WorkflowNode } from '../model/workflow/workflow-node';
import { BroadcastService } from './broadcast.service';
import { ModelService } from './model.service';

/**
 * JsPlumbService
 * provides all of the operations about jsplumb plugin.
 */
@Injectable()
export class JsPlumbService {
    public jsplumbInstanceMap = new Map<string, any>();

    private padding = 20;
    private rootClass = 'canvas';

    constructor(private modelService: ModelService) {
    }

    public connectChildrenNodes(parentNodeId: string) {
        const nodes: WorkflowNode[] = this.modelService.getChildrenNodes(parentNodeId);

        if (nodes && (nodes.length > 0)) {
            const jsplumbInstance = this.jsplumbInstanceMap.get(parentNodeId);
            nodes.forEach(node =>
                node.connection.forEach(target =>
                    jsplumbInstance.connect({ source: node.id, target })));
        }
    }

    public initJsPlumbInstance(id: string) {
        if (this.jsplumbInstanceMap.get(id)) {
            return;
        }
        const jsplumbInstance = jsp.jsPlumb.getInstance();

        jsplumbInstance.importDefaults({
            Anchor: ['Top', 'RightMiddle', 'LeftMiddle', 'Bottom'],
            Connector: [
                'Flowchart',
                { cornerRadius: 0, stub: 0, gap: 3 },
            ],
            ConnectionOverlays: [
                [
                    'Arrow',
                    { direction: 1, foldback: 1, location: 1, width: 10, length: 10 },
                ],
                ['Label', { label: '', id: 'label', cssClass: 'aLabel' }],
            ],
            Endpoint: 'Blank',
            PaintStyle: {
                strokeWidth: 4,
                stroke: 'black',
            },
            HoverPaintStyle: {
                strokeWidth: 4,
                stroke: 'blue',
            },
        });

        // add connection to model data while a new connection is build
        jsplumbInstance.bind('connection', info => {
            this.modelService.addConnection(info.connection.sourceId, info.connection.targetId);

            info.connection.bind('click', connection => {
                this.modelService.deleteConnection(connection.sourceId, connection.targetId);
                jsplumbInstance.select({ connections: [connection] }).delete();
            });
        });

        this.jsplumbInstanceMap.set(id, jsplumbInstance);
    }

    public getParentNodeId(id: string): string {
        const nodeElement = jsp.jsPlumb.getSelector('#' + id);
        const parentNode = this.getParentNodeEl(nodeElement[0]);

        return parentNode ? parentNode.id : null;
    }

    public initNode(node: WorkflowNode) {
        const jsplumbInstance = this.jsplumbInstanceMap.get(node.parentId);

        this.jsplumbInstanceMap.get(this.modelService.rootNodeId).draggable(node.id, {
            scope: 'node',
            filter: '.ui-resizable-handle',
            classes: {
                'ui-draggable': 'dragging',
            },
            drag: event => {
                this.jsplumbInstanceMap.get(node.parentId).revalidate(node.id);
            },
            stop: event => {
                event.el.classList.remove('dragging');
                node.position.left = event.pos[0];
                node.position.top = event.pos[1];
            },
        });

        jsplumbInstance.makeTarget(node.id, {
            detachable: false,
            isTarget: true,
            maxConnections: -1,
        });

        jsplumbInstance.makeSource(node.id, {
            filter: '.anchor, .anchor *',
            detachable: false,
            isSource: true,
            maxConnections: -1,
        });
    }

    public nodeDroppable(node: WorkflowNode, rank: number) {
        const jsplumbInstance = this.jsplumbInstanceMap.get(node.parentId);

        const selector = jsplumbInstance.getSelector('#' + node.id);
        this.jsplumbInstanceMap.get(this.modelService.rootNodeId).droppable(selector, {
            scope: 'node',
            rank,
            tolerance: 'pointer',
            hoverClass: 'drop-target',
            drop: event => {
                if (!this.isChildNode(event.drop.el, event.drag.el)) {
                    this.drop(event);
                }
                return true;
            },
            canDrop: drag => {
                const nodeMap = this.modelService.getNodeMap();
                const ancestorNode = nodeMap.get(drag.el.id);

                const isAncestor = this.modelService.isDescendantNode(ancestorNode, node.id);
                return !isAncestor;
            },
        });
    }

    private isChildNode(childElement, parentElement) {
        while (childElement !== parentElement) {
            childElement = childElement.parentNode;
            if (childElement.classList.contains('canvas')) {
                return false;
            }
        }

        return true;
    }

    private drop(event) {
        const dragEl = event.drag.el;
        const dropEl = event.drop.el;

        this.resizeParent(dragEl, dropEl);

        const nodeLeft = dragEl.getBoundingClientRect().left;
        const nodeTop = dragEl.getBoundingClientRect().top;
        const parentLeft = dropEl.getBoundingClientRect().left;
        const parentTop = dropEl.getBoundingClientRect().top;
        const left = nodeLeft - parentLeft;
        const top = nodeTop - parentTop;
        dragEl.style.top = top + 'px';
        dragEl.style.left = left + 'px';

        this.modelService.updatePosition(dragEl.id, left, top, dragEl.getBoundingClientRect().width, dragEl.getBoundingClientRect().height);

        const originalParentNode = this.getParentNodeEl(dragEl);
        const originalParentNodeId = originalParentNode ? originalParentNode.id : this.modelService.rootNodeId;

        const targetParentNodeId = dropEl.classList.contains('node') ? dropEl.id : this.modelService.rootNodeId;
        this.changeParent(dragEl.id, originalParentNodeId, targetParentNodeId);
    }

    private changeParent(id: string, originalParentNodeId: string, targetParentNodeId: string) {
        if (originalParentNodeId !== targetParentNodeId) {
            this.jsplumbInstanceMap.get(originalParentNodeId).removeAllEndpoints(id);
            this.modelService.changeParent(id, originalParentNodeId, targetParentNodeId);
        }
    }

    private getParentNodeEl(element) {
        while (!(element.parentNode.classList.contains('node') || element.parentNode.classList.contains('canvas'))) {
            element = element.parentNode;
        }

        if (element.parentNode.classList.contains('canvas')) { // top level node
            return null;
        } else {
            return element.parentNode;
        }
    }

    public canvasDroppable() {
        const jsplumbInstance = this.jsplumbInstanceMap.get(this.modelService.rootNodeId);
        const canvasSelector = jsplumbInstance.getSelector('.canvas');
        console.log(canvasSelector);
        jsplumbInstance.droppable(canvasSelector, {
            scope: 'node',
            rank: 0,
            drop: event => this.drop(event),
        });
    }

    public buttonDraggable() {
        const jsplumbInstance = this.jsplumbInstanceMap.get(this.modelService.rootNodeId);
        const selector = jsplumbInstance.getSelector('.toolbar .item');
        jsplumbInstance.draggable(selector,
            {
                scope: 'btn',
                clone: true,
            });
    }

    public buttonDroppable() {
        const jsplumbInstance = this.jsplumbInstanceMap.get(this.modelService.rootNodeId);
        const selector = jsplumbInstance.getSelector('.canvas');
        jsplumbInstance.droppable(selector, {
            scope: 'btn',
            drop: event => {
                const el = jsplumbInstance.getSelector(event.drag.el);
                const type = el.attributes.nodeType.value;
                const left = event.e.clientX - event.drop.position[0];
                const top = event.e.clientY - event.drop.position[1];

                this.modelService.addNode(type, type, left, top);
            },
        });
    }

    public remove(node: WorkflowNode) {
        this.jsplumbInstanceMap.get(node.parentId).remove(node.id);
    }

    public resizeParent(element: any, parentElement: any) {
        if (parentElement.classList.contains(this.rootClass)) {
            return;
        }

        if (!parentElement.classList.contains('node')) {
            this.resizeParent(element, parentElement.parentNode);
            return;
        }

        const leftResized = this.resizeParentLeft(element, parentElement);
        const rightResized = this.resizeParentRight(element, parentElement);
        const topResized = this.resizeParentTop(element, parentElement);
        const bottomResized = this.resizeParentBottom(element, parentElement);

        if (leftResized || rightResized || topResized || bottomResized) {
            if (parentElement.classList.contains('node')) {
                const rect = parentElement.getBoundingClientRect();
                this.modelService.updatePosition(parentElement.id,
                    parentElement.offsetLeft,
                    parentElement.offsetTop,
                    rect.width, rect.height);
            }
            this.resizeParent(parentElement, parentElement.parentNode);
        }
    }

    private resizeParentLeft(element: any, parentElement: any): boolean {
        let resized = false;

        const actualLeft = element.getBoundingClientRect().left;
        const actualParentLeft = parentElement.getBoundingClientRect().left;

        if (actualLeft - this.padding < actualParentLeft) {
            const width = actualParentLeft - actualLeft + this.padding;

            this.translateElement(parentElement, -width, 0, width, 0);
            this.translateChildren(parentElement, element, width, 0);
            resized = true;
        }

        return resized;
    }

    private resizeParentRight(element: any, parentElement: any): boolean {
        let resized = false;

        const actualLeft = element.getBoundingClientRect().left;
        const actualRight = actualLeft + element.offsetWidth;

        const actualParentLeft = parentElement.getBoundingClientRect().left;

        if ((actualParentLeft + parentElement.offsetWidth) < actualRight + this.padding) {
            this.setElementWidth(parentElement, actualRight + this.padding - actualParentLeft);
            resized = true;
        }

        return resized;
    }

    private resizeParentBottom(element: any, parentElement: any): boolean {
        let resized = false;

        const actualTop = element.getBoundingClientRect().top;
        const actualBottom = actualTop + element.offsetHeight;

        const actualParentTop = parentElement.getBoundingClientRect().top;
        const actualParentBottom = actualParentTop + parentElement.offsetHeight;

        if (actualParentBottom < actualBottom + this.padding) {
            this.setElementHeight(parentElement, actualBottom + this.padding - actualParentTop);
            resized = true;
        }

        return resized;
    }

    private resizeParentTop(element: any, parentElement: any): boolean {
        let resized = false;

        const actualTop = element.getBoundingClientRect().top;
        const actualParentTop = parentElement.getBoundingClientRect().top;

        if (actualTop - this.padding < actualParentTop) {
            const height = actualParentTop - actualTop + this.padding;

            this.translateElement(parentElement, 0, -height, 0, height);
            this.translateChildren(parentElement, element, 0, height);
            resized = true;
        }

        return resized;
    }

    private translateElement(element, left: number, top: number, width: number, height: number) {
        const offsetLeft = element.offsetLeft + left;
        element.style.left = offsetLeft + 'px';

        const offsetTop = element.offsetTop + top;
        element.style.top = offsetTop + 'px';

        const offsetWidth = element.offsetWidth + width;
        element.style.width = offsetWidth + 'px';

        const offsetHeight = element.offsetHeight + height;
        element.style.height = offsetHeight + 'px';

        if (element.classList.contains('node')) {
            const node = this.modelService.getNodeMap().get(element.id);
            this.jsplumbInstanceMap.get(node.parentId).revalidate(element.id);
        }
    }

    private translateChildren(parentElment, excludeElement, left: number, top: number) {
        for (let i = 0, len = parentElment.children.length; i < len; i++) {
            const childElment = parentElment.children[i];
            if (childElment.localName === 'b4t-node') {
                this.translateElement(childElment.children[0], left, top, 0, 0);
            }
        }
    }

    private setElementHeight(element, height: number) {
        element.style.height = height + 'px';
    }

    private setElementWidth(element, width: number) {
        element.style.width = width + 'px';
    }

    private getActualPosition(element, offset: string) {
        let actualPosition = element[offset];
        let current = element.offsetParent;
        while (current !== null) {
            actualPosition += element[offset];
            current = current.offsetParent;
        }
        return actualPosition;
    }
}
