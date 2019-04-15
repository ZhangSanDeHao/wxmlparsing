import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Tokenizer } from '../src/tokenizer';

import { Document, Element } from '../src/node';
import parser from '../src/parser';
import generator from '../src/generator';

describe('Node operate', () => {
  it('Document: firstChild', () => {
    const opts = {
      sourceStr: '<abc b="ab"></abc>'
    };

    const doc: Document = parser.parse(opts.sourceStr);
    expect(doc.firstChild).eq(doc.children![0]);
    expect(doc.lastChild).eq(doc.children![0]);
  });

  it('Document: lastChild', () => {
    const opts = {
      sourceStr: '<abc b="ab"></abc><w />'
    };

    const doc: Document = parser.parse(opts.sourceStr);
    expect((doc.lastChild as Element).tagName).eq('w');
    expect(doc.lastChild).eq(doc.children![1]);
  });

  it('Attribute: get', () => {
    const opts = {
      sourceStr: '<abc b="ab"></abc>'
    };

    const doc: Document = parser.parse(opts.sourceStr);
    const attrValue = doc.firstChild!.getAttribute('b');
    expect(attrValue).eq('ab');
  });

  it('Attribute: set', () => {
    const opts = {
      sourceStr: '<abc b="ab"></abc>',
      targetStr: '<abc b="ab" class="newClass"></abc>'
    };

    const doc: Document = parser.parse(opts.sourceStr);
    doc.firstChild!.setAttribute('class', 'newClass');
    const newXmlStr: string = generator.generate(doc, { format: false });
    expect(newXmlStr).eq(opts.targetStr);
  });

  it('Attribute: delete', () => {
    const opts = {
      sourceStr: '<abc b="ab"></abc>',
      targetStr: '<abc></abc>'
    };

    const doc: Document = parser.parse(opts.sourceStr);
    doc.firstChild!.removeAttribute('b');
    const newXmlStr: string = generator.generate(doc, { format: false });
    expect(newXmlStr).eq(opts.targetStr);
  });

  it('Node: traverse', () => {
    const opts = {
      sourceStr: '<abc b="ab"><a/><b/><c/><d><e/></d></abc>'
    };

    const doc: Document = parser.parse(opts.sourceStr);
    const result = [];
    doc.traverse(element => {
      result.push(element);
    });
    expect(result.length).eq(6);
  });

  it('Node: getElementsByTagName', () => {
    const opts = {
      sourceStr: '<abc b="ab"><a/><b/><c/><d><a/></d></abc>'
    };

    const doc: Document = parser.parse(opts.sourceStr);
    const result = doc.getElementsByTagName('a');
    expect(result.length).eq(2);
  });
});
