class Node {
    constructor(type, value = null, left = null, right = null) {
      this.type = type;
      this.value = value;
      this.left = left;
      this.right = right;
    }
  }
  
  function createRule(ruleString) {
    const tokens = tokenize(ruleString);
    return parseExpression(tokens);
  }
  
  function tokenize(ruleString) {
    return ruleString.match(/\(|\)|\w+|'[^']*'|>=|<=|>|<|=|AND|OR/g);
  }
  
  function parseExpression(tokens) {
    let stack = [];
    let output = [];
  
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === '(') {
        stack.push(i);
      } else if (tokens[i] === ')') {
        let start = stack.pop();
        let subExpr = parseExpression(tokens.slice(start + 1, i));
        output.push(subExpr);
      } else if (tokens[i] === 'AND' || tokens[i] === 'OR') {
        output.push(tokens[i]);
      } else {
        output.push(new Node('operand', {
          operand: tokens[i],
          operator: tokens[i + 1],
          value: tokens[i + 2].replace(/'/g, '')
        }));
        i += 2;
      }
    }
    return buildTree(output);
  }
  
  function buildTree(tokens) {
    if (tokens.length === 1) return tokens[0];
  
    let rootOp = tokens.findIndex(t => t === 'AND' || t === 'OR');
    if (rootOp === -1) return tokens[0];
  
    let left = buildTree(tokens.slice(0, rootOp));
    let right = buildTree(tokens.slice(rootOp + 1));
  
    return new Node('operator', tokens[rootOp], left, right);
  }
  
  const combineRules = (ruleStrings, operator = 'AND') => {
    if (!ruleStrings || ruleStrings.length === 0) {
      throw new Error('No rules provided to combine.');
    }
  
    // Parse each rule string into its respective AST
    const asts = ruleStrings.map(ruleString => parseRuleString(ruleString));
  
    // If only one rule is provided, return its AST
    if (asts.length === 1) {
      return asts[0];
    }
  
    // Combine the ASTs using the provided operator
    let combinedAST = asts[0];
    for (let i = 1; i < asts.length; i++) {
      combinedAST = new Node('operator', combinedAST, asts[i], operator);
    }
  
    return combinedAST;
  };

  const evaluateRule = (node, data) => {
    if (node.type === 'operand') {
      const { leftOperand, operator, rightOperand } = node.value;
      switch (operator) {
        case '>':
          return data[leftOperand] > parseFloat(rightOperand);
        case '<':
          return data[leftOperand] < parseFloat(rightOperand);
        case '=':
          return data[leftOperand] === rightOperand.replace(/'/g, '');
        default:
          return false;
      }
    } else if (node.type === 'operator') {
      const leftEval = evaluateRule(node.left, data);
      const rightEval = evaluateRule(node.right, data);
      switch (node.value) {
        case 'AND':
          return leftEval && rightEval;
        case 'OR':
          return leftEval || rightEval;
        default:
          return false;
      }
    }
    return false;
  };

  module.exports = {
    createRule,
    combineRules,
    evaluateRule
  }