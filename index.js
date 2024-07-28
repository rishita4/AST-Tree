const express = require('express');
const bodyParser = require('body-parser');
const {createRule, combineRules, evaluateRule} = require('./HelperFunctions');
const path = require('path');
const app = express();
app.use(bodyParser.json());

let rules = [];

app.post('/create_rule', (req, res) => {
  const ruleString = req.body.ruleString;
  const rootNode = createRule(ruleString);
  rules.push(rootNode);
  console.log("rule created")
  res.json(rootNode);
});

app.post('/combine_rules', (req, res) => {
  const ruleStrings = req.body.rules;
  const combinedRootNode = combineRules(ruleStrings);
  res.json(combinedRootNode);
});

app.post('/evaluate_rule', (req, res) => {
  const ruleJson = req.body.ruleJson;
  const data = req.body.data;
  const isEligible = evaluateRule(ruleJson, data);
  res.json({ eligible: isEligible });
});

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname+'/public/index.html'));
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
