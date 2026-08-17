import re

with open('server.ts', 'r') as f:
    content = f.read()

target = """Act as a senior market analyst and industrial procurement expert.
Analyze the following industrial MRO product: "${query}"

Perform Google Search Grounding to find real, current commercial facts. Focus on:
1. Identifying 2-3 direct competitor alternative models from brands like SKF, Parker, Siemens, Rockwell Allen-Bradley, Festo, Norgren, Timken, etc.
2. Comparing technical specs, efficiency, lifespans, certification levels, and market pricing.
3. Formulating a structured 'Buy vs. Sell' advisory recommendation for engineering leadership and senior procurement officers.

Return your analysis in this exact format. Do not deviate from this schema:

# Market Intelligence Report: ${query}

## Executive Summary
Provide a concise, professional overview of the market position of this model.

## Direct Competitor Line-up
* **Competitor Brand**: [Brand Name]
  * *Model*: [Alternative MPN]
  * *MSRP/Est Price*: [Price or Range]
  * *Key Advantage*: [Technical Advantage]
  * *Key Disadvantage*: [Technical Disadvantage]
* **Competitor Brand**: [Brand Name 2]
  * *Model*: [Alternative MPN 2]
  * *MSRP/Est Price*: [Price or Range]
  * *Key Advantage*: [Technical Advantage]
  * *Key Disadvantage*: [Technical Disadvantage]

## Comparative Technical Matrix
* **Technical Parameter**: [e.g. Operating Temperature, Pressure Rating, Load Capacity]
  * *Subject Model*: [Spec Value]
  * *Competitor Alternative*: [Spec Value]
* **Technical Parameter**: [e.g. Life Cycle / MTBF]
  * *Subject Model*: [Spec Value]
  * *Competitor Alternative*: [Spec Value]

## Market Recommendation: [BUY or SELL or ACCUMULATE or DISCONTINUE]
Provide a highly technical, rigorous argument justifying the recommendation. Focus on:
- Total Cost of Ownership (TCO)
- Availability/Lead times
- Interoperability & certification standards (ANSI, ISO, NEMA, etc.)"""

replacement = """Act as a Business Analytics Industry Expert with 30+ years of Industrial and Business experience.
Analyze the following industrial MRO product: "${query}"

Perform Google Search Grounding to find real, current commercial facts. Focus on:
1. Identifying 2-3 direct competitor alternative models from brands like SKF, Parker, Siemens, Rockwell Allen-Bradley, Festo, Norgren, Timken, etc.
2. Comparing technical specs, efficiency, lifespans, certification levels, and market pricing.
3. Formulating a structured 'Buy vs. Sell' advisory recommendation for engineering leadership and senior procurement officers.
4. Concluding with a robust marketing and business growth strategy for Industry Leaders.

Return your analysis in this exact format. Do not deviate from this schema:

# Market Intelligence Report: ${query}

## Executive Summary
Provide a concise, professional overview of the market position of this model.

## Direct Competitor Line-up
* **Competitor Brand**: [Brand Name]
  * *Model*: [Alternative MPN]
  * *MSRP/Est Price*: [Price or Range]
  * *Key Advantage*: [Technical Advantage]
  * *Key Disadvantage*: [Technical Disadvantage]
* **Competitor Brand**: [Brand Name 2]
  * *Model*: [Alternative MPN 2]
  * *MSRP/Est Price*: [Price or Range]
  * *Key Advantage*: [Technical Advantage]
  * *Key Disadvantage*: [Technical Disadvantage]

## Comparative Technical Matrix
* **Technical Parameter**: [e.g. Operating Temperature, Pressure Rating, Load Capacity]
  * *Subject Model*: [Spec Value]
  * *Competitor Alternative*: [Spec Value]
* **Technical Parameter**: [e.g. Life Cycle / MTBF]
  * *Subject Model*: [Spec Value]
  * *Competitor Alternative*: [Spec Value]

## Market Recommendation: [BUY or SELL or ACCUMULATE or DISCONTINUE]
Provide a highly technical, rigorous argument justifying the recommendation. Focus on:
- Total Cost of Ownership (TCO)
- Availability/Lead times
- Interoperability & certification standards (ANSI, ISO, NEMA, etc.)

## Executive Business & Growth Strategy
Conclude with a high-level marketing or business strategy for this product category that will effectively help Industry Leaders grow their business. Focus on market positioning, scaling operations, targeting key industrial sectors, or innovating supply chain approaches."""

new_content = content.replace(target, replacement)

with open('server.ts', 'w') as f:
    f.write(new_content)
