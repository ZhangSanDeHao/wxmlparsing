import { EventValue, GenerateOptions } from '../types/tokenizer';
import parser from './parser';
import generator from './generator';

type NodeType =
  | 'document'
  | 'element'
  | 'text'
  | 'comment'
  | 'cdata'
  | 'fragment';
type Func = (key: string, value: string | null) => void;

class Attribute {
  public key: string;
  public value: string | null;

  constructor(key: string, value: string | null) {
    this.key = key;
    this.value = value;
  }

  public get isBoolean(): boolean {
    return this.value === null;
  }

  public setKey(key: string) {
    this.key = key;
  }

  public setValue(value: string) {
    this.value = value;
  }
}

// AttributeList
export class AttributeList {
  [key: string]:
    | string
    | Attribute[]
    | null
    | Func
    | Attribute
    | number
    | object;

  public attributes: Attribute[] = [];
  private object: { [key: string]: Attribute } = {};

  public get length() {
    return this.attributes.length;
  }

  public getIndex(key: string) {
    let index = -1;
    if (this.object.hasOwnProperty(key)) {
      const attri = this.object[key];
      index = this.attributes.indexOf(attri as Attribute);
    }
    return index;
  }

  public has(key: string): boolean {
    return this.getIndex(key) !== -1;
  }

  public get(key: string): Attribute | null {
    if (this.has(key)) {
      return this.object[key] as Attribute;
    }
    return null;
  }

  public set(key: string, value: string | null) {
    let attr: Attribute;
    if (this.object.hasOwnProperty(key)) {
      attr = this.object[key];
      attr.value = value;
    } else {
      attr = new Attribute(key, value);
      this.attributes.push(attr);
      this.object[key] = attr;
    }
  }

  public remove(key: string): Attribute | null {
    const index = this.getIndex(key);
    let result = null;
    if (index !== -1) {
      delete this.object[key];
      result = this.attributes.splice(index, 1)[0];
    }
    return result;
  }

  public modify(key: string, newKey: string, newValue?: string) {
    const attri = this.get(key);
    if (attri) {
      attri.key = newKey;
      this.object[newKey] = this.object[key];
      delete this.object[key];

      if (newValue) {
        attri.value = newValue;
      }
    }
  }

  public forEach(
    func: (
      attribute: Attribute,
      index: number,
      attributes: Attribute[]
    ) => void,
    context: any = null
  ) {
    this.attributes.forEach((attribute, index, attributes) => {
      func.call(context, attribute, index, attributes);
    });
  }
}

// Node
export class Node {
  public nodeType: NodeType;
  public nodeValue?: string | null = null;

  public attributes?: AttributeList | null;

  public children: Node[] | undefined;
  public parentNode?: Node | null;

  public selfClosing?: boolean;
  public stats?: EventValue;

  constructor(type: NodeType, stats: EventValue) {
    this.nodeType = type;
    this.stats = stats;
  }

  // firstChild
  public get firstChild(): Node | null {
    return (this.children && this.children[0]) || null;
  }

  // lastChild
  public get lastChild(): Node | null {
    return (this.children && this.children[this.children.length - 1]) || null;
  }

  // attribute operator
  public getAttribute(key: string): string | null | undefined {
    let value;
    if (this.attributes && this.attributes.get(key)) {
      value = this.attributes.get(key)!.value;
    }
    return value;
  }

  public setAttribute(key: string, value: string | null) {
    if (!this.attributes) {
      this.attributes = new AttributeList();
    }
    this.attributes.set(key, value);
  }

  public removeAttribute(key: string) {
    if (this.attributes) {
      this.attributes.remove(key);
    }
  }

  public hasAttribute(key: string) {
    return this.attributes && this.attributes.has(key);
  }

  public modifyAttribute(key: string, newKey: string, newValue?: string) {
    if (this.attributes) {
      this.attributes.modify(key, newKey, newValue);
    }
  }

  public forEachAttributes(
    func: (
      attribute: Attribute,
      index: number,
      attributes: Attribute[]
    ) => void,
    context: any = null
  ) {
    if (this.attributes) {
      this.attributes.forEach(func, context);
    }
  }

  // insertElement
  public insertElement(newNode: Node, index: number): Node {
    const children = this.children || [];
    children.splice(index, 0, newNode);

    if (newNode.parentNode) {
      newNode.parentNode.removeChild(newNode);
    }
    newNode.parentNode = this;
    this.children = children;
    return newNode;
  }

  // children operate
  public appendChild(node: Node): Node {
    let newNodes: Node[] = [];
    if (['document', 'fragment'].includes(node.nodeType)) {
      newNodes = node.children || [];
    } else {
      newNodes.push(node);
    }

    newNodes.forEach(item => {
      const index = this.children ? this.children.length : 0;
      this.insertElement(item, index);
    });

    return node;
  }

  // insertBefore
  public insertBefore(newNode: Node, referenceNode: Node): Node {
    const index = (this.children || []).indexOf(referenceNode);
    if (index !== -1) {
      this.insertElement(newNode, index);
      return newNode;
    } else {
      throw new Error('insertBefore: referenceNode is not node children.');
    }
  }

  // insertAfter
  public insertAfter(newNode: Node, referenceNode: Node): Node {
    const index = (this.children || []).indexOf(referenceNode);
    if (index !== -1) {
      this.insertElement(newNode, index + 1);
      return newNode;
    } else {
      throw new Error('insertAfter: referenceNode is not node children.');
    }
  }

  // removeChild
  public removeChild(node: Node): Node {
    if (this.children && this.children.includes(node)) {
      const index = this.children.indexOf(node);
      this.children.splice(index, 1);
      delete node.parentNode;
      return node;
    }
    throw new Error('removeChild: the node is not a child of this node.');
  }

  // replaceWith
  public replaceWith(node: Node): void {
    if (this.parentNode) {
      this.parentNode.insertBefore(node, this);
      this.remove();
    }
  }

  // remove self
  public remove(): Node {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
    return this;
  }

  // empty: remove all children node
  public empty(): Node[] {
    const children: Node[] = [];
    if (this.children) {
      while (this.children.length) {
        children.push(this.children[0].remove());
      }
    }
    return children;
  }

  // clone
  public cloneNode(deep: boolean = false): Node {
    // @TODO: implement
    return this;
  }

  // toString
  public toString(options?: GenerateOptions): string {
    return generator.generate(this, options);
  }

  // outerXML
  get outerXML(): string {
    return this.toString();
  }

  set outerXML(xmlString: string) {
    const doc = parser.parse(xmlString);
    if (doc.children) {
      [...doc.children].forEach(elem => {
        this.parentNode!.insertBefore(elem, this);
      });
      this.remove();
    }
  }

  // innerXML
  get innerXML(): string {
    let result = '';
    if (this.children) {
      const childrenStrs = this.children.map(node => {
        return node.toString();
      });
      result = childrenStrs.join('\n');
    }
    return result;
  }

  set innerXML(xmlString: string) {
    const doc = parser.parse(xmlString);
    this.empty();
    if (doc.children) {
      doc.children.forEach(elem => {
        this.appendChild(elem);
      });
    }
  }

  // previousSibling
  get previousSibling(): Node | null {
    let node = null;
    if (this.parentNode) {
      const index = this.parentNode.children!.indexOf(this);
      node = this.parentNode.children![index - 1];
    }
    return node;
  }

  // previousElementSibling
  get previousElementSibling(): Element | null {
    let node = this.previousSibling;
    while (node && node.nodeType !== 'element') {
      node = node.previousSibling;
    }
    return node as Element;
  }

  // nextSibling
  get nextSibling(): Node | null {
    let node = null;
    if (this.parentNode) {
      const index = this.parentNode.children!.indexOf(this);
      node = this.parentNode.children![index + 1];
    }
    return node;
  }

  // nextElementSibling
  get nextElementSibling(): Element | null {
    let node = this.nextSibling;
    while (node && node.nodeType !== 'element') {
      node = node.nextSibling;
    }
    return node as Element;
  }

  // getElementsByTagName
  public getElementsByTagName(elementName: string): Element[] {
    const result: Element[] = [];
    this.traverse(element => {
      if (
        element.nodeType === 'element' &&
        (element as Element).tagName === elementName
      ) {
        result.push(element as Element);
      }
    });
    return result;
  }

  // traverse
  public traverse(callback: (node: Node) => void) {
    if (this.children && this.children.length) {
      [...this.children].forEach(element => {
        callback(element);
        element.traverse(callback); // recursive
      });
    }
  }

  // create element
  public createElement(tagName: string) {
    return new Element({
      value: tagName
    });
  }

  public createComment(data: string) {
    return new Comment({
      value: data
    });
  }

  public createTextNode(data: string) {
    return new Text({
      value: data
    });
  }

  public createFragment() {
    return new Fragment();
  }
}

// Text Node
export class Text extends Node {
  constructor(stats: EventValue) {
    super('text', stats);
    this.nodeValue = stats.value;
  }
}

// Comment Node
export class Comment extends Node {
  constructor(stats: EventValue) {
    super('comment', stats);
    this.nodeValue = stats.value;
  }
}

// Cdata Node
export class Cdata extends Node {
  constructor(stats: EventValue) {
    super('cdata', stats);
    this.nodeValue = stats.value;
  }
}

// Element Node
export class Element extends Node {
  public tagName: string;

  constructor(stats: EventValue) {
    super('element', stats);
    this.tagName = stats!.value!;
  }
}

// Document Node
export class Document extends Node {
  constructor(stats: EventValue) {
    super('document', stats);
  }
}

// Fragment Node
export class Fragment extends Node {
  constructor() {
    super('fragment', {});
  }
}
