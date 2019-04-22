import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Tokenizer } from '../src/tokenizer';

import { Document } from '../src/node';
import parser from '../src/parser';
import generator from '../src/generator';

function itCase(
  opts: {
    title: string;
    sourceStr: string;
    targetStr: string;
  },
  generateOpts: { format: boolean | string; attributeNewline?: boolean } = {
    format: false,
    attributeNewline: false
  }
) {
  it(opts.title, () => {
    const ast: Document = parser.parse(opts.sourceStr);
    const newXmlStr: string = generator.generate(ast, generateOpts);

    expect(newXmlStr).eq(opts.targetStr);
  });
}

describe('Generator', () => {
  itCase({
    title: 'Empty xml',
    sourceStr: '',
    targetStr: ''
  });

  itCase({
    title: 'Element xml',
    sourceStr: '<a></a>',
    targetStr: '<a></a>'
  });

  // Attribute
  itCase({
    title: 'Element width attribute',
    sourceStr: '<abc b = "hello"></abc>',
    targetStr: '<abc b="hello"></abc>'
  });

  itCase({
    title: 'Element width attribute escape',
    sourceStr: '<abc b="hello\\""></abc>',
    targetStr: '<abc b="hello\\""></abc>'
  });

  itCase({
    title: 'Element attribute without quotes',
    sourceStr: '<abc a=33></abc>',
    targetStr: '<abc a="33"></abc>'
  });

  itCase({
    title: 'Child element',
    sourceStr: '<a><br/></a>',
    targetStr: `<a><br/></a>`
  });

  // format
  itCase(
    {
      title: 'format xml',
      sourceStr: '<a><br/></a>',
      targetStr: `<a>\n  <br/>\n</a>`
    },
    {
      format: true
    }
  );

  itCase(
    {
      title: 'format xml without children',
      sourceStr: '<a></a>',
      targetStr: `<a></a>`
    },
    {
      format: true
    }
  );

  itCase(
    {
      title: 'format with tab',
      sourceStr: '<a><br/></a>',
      targetStr: `<a>\n\t<br/>\n</a>`
    },
    {
      format: '\t'
    }
  );

  itCase(
    {
      title: 'format with attributeNewline',
      sourceStr: '<a x="33"><br/></a>',
      targetStr: `<a\n  x="33"\n>\n  <br/>\n</a>`
    },
    {
      format: true,
      attributeNewline: true
    }
  );

  // self-closing
  itCase({
    title: 'Self-closing',
    sourceStr: '<a/>',
    targetStr: '<a/>'
  });

  itCase({
    title: 'Plain text',
    sourceStr: 'abc',
    targetStr: 'abc'
  });

  itCase({
    title: 'Coment ',
    sourceStr: '<!-- abc -->',
    targetStr: '<!-- abc -->'
  });

  itCase({
    title: 'Cdata ',
    sourceStr: '<![CDATA[ cdata content ]]>',
    targetStr: '<![CDATA[ cdata content ]]>'
  });

  itCase({
    title: 'style ',
    sourceStr: '<style id="33">console.infoasdf<a""sd>sad</a></style>',
    targetStr: '<style id="33">console.infoasdf<a""sd>sad</a></style>'
  });

  itCase({
    title: 'script ',
    sourceStr: '<script type="texts">console.info("<a""sd>sad</a>")</script>',
    targetStr: '<script type="texts">console.info("<a""sd>sad</a>")</script>'
  });
});