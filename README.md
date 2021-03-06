# xmlparsing

> XML 解析器，支持布尔属性、自结束标签元素、保持元素属性。

## 安装

```shell
npm i xmlparsing
```

## 使用

```js
import { parser, generator } from 'xmlparsing';

// parse
const xmlDocument = parser.parse('<hello class="red"></hello>');

// firstChild
const helloElement = xmlDocument.firstChild;

// tagName
console.info(helloElement.tagName); // hello

// getAttribute
console.info(helloElement.getAttribute('class')); // red;

helloElement.setAttribute('class', 'green');

// generate
generator.generate(xmlDocument); // <hello class="green"></hello>
```

## 元素类型

- Document
- Element
- Fragment
- Text
- Comment
- Cdata

## 属性

### nodeType

类型：string

节点类型：document、element、fragment、text、comment、cdata 类型

### nodeValue

类型：string | null

节点值：Text 节点、Comment 节点、Cdata 节点的文本内容，其他节点的 nodeValue 为 null

### children [Node]

所有子节点数组

### parentNode

父节点

### previousSibling

前一个兄弟节点

### previousElementSibling

前一个兄弟元素节点

### nextSibling

后一个兄弟节点

### nextElementSibling

后一个兄弟元素节点

### firstChild

第一个子节点

### lastChild

最后一个子节点

### outerXML

节点字符串文本

### innerXML

所有子节点的字符串文本

## 方法

### getAttribute(attributName)

说明：获取属性值

参数：attributeName 属性名

```js
// <div class="hello" />
node.getAttribute('class'); // 'hello'
```

### setAttribute(attributeName, newValue)

说明： 设置属性值

参数： attributeName 属性名， newValue 属性值

```js
// <div class="hello" />
node.getAttribute('class', 'green');
node.getAttribute('id', 'abc'); // <div class="green" id="abc"></div>
```

### removeAttribute(attributeName)

说明： 删除节点属性

参数： attributeName

```js
// <div class="hello" />
node.removeAttribute('class');
node.getAttribute('id', 'abc'); // <div></div>
```

### hasAttribute(attributName)

说明： 判断节点是否有纯在的属性

参数： attributeName

```js
// <div class="hello" />
node.removeAttribute('class');
node.getAttribute('id', 'abc'); // <div></div>
```

### appendChild(childNode)

说明： 添加子节点

参数： childNode

```js
// <div class="hello" />
const newNode = node.createElement('xyz');
node.appendChild(newNode); // <div class="hello"><xyz></xyz></div>
```

### insertBefore(newNode, referenceNode)

说明： 在参考节点前插入节点

参数： newNode 新节点，referenceNode 参考相关节点

```js
// <div><x /></div>
const newNode = node.createElement('y');
node.insertBefore(newNode, node.firstChild); // <div><y></y><x /></div>
```

### insertAfter(newNode, referenceNode)

说明： 在参考节点后插入节点

参数： newNode 新节点，referenceNode 参考相关节点

```js
// <div><x /></div>
const newNode = node.createElement('y');
node.insertAfter(newNode, node.firstChild); // <div><x /><y></y></div>
```

### before(newNode[, newNode...])

说明：在节点前添加新节点

参数： newNode

```js
// <div></div>
const newNode = node.createElement('y');
node.before(newNode); // <y></y><div></div>
```

### after(newNode[, newNode...])

说明：在节点后添加新节点

参数： newNode

```js
// <div></div>
const newNode = node.createElement('y');
node.after(newNode); // <div></div><y></y>
```

### removeChild(childNode)

说明：删除子节点

参数： newNode

```js
// <div><a /><b /></div>
const newNode = node.removeChild(node.firstChild); <div><b /></div>
```


### replaceWith(newNode)

说明：用新节点替换节点本身

### remove()

说明：删除节点本身

### empty()

说明：清空节点所有子节点

### cloneNode([deep])

说明：克隆节点本身

### toString()

说明：返回节点字符串序列

### getElementsByTagName(tagName)

说明：返回所有指定节点名称的所有子节点

### createElement(nodeType)

说明：创建新元素节点

### createComment([commentText])

说明：创建注释节点

### createTextNode([text])

说明：创建文本节点

### createFragment()

说明：创建片段节点
