import fs from 'fs';
import parse, { AST } from './parser';
import generator from './generator';

const xmlStr: string = fs.readFileSync('./src/template', 'utf8');

const ast: AST = parse.parse(xmlStr);
console.info(ast);

const newStr: string = generator.generate(ast);

debugger; // tslint:disable-line
