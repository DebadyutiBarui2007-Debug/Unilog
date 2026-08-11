import re

with open('src/components/InteractiveTutorial.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
step_idx = 1
in_tutorial_steps = False

for line in lines:
    if "const tutorialSteps: TutorialStep[] = [" in line:
        in_tutorial_steps = True

    if in_tutorial_steps:
        # Check if we are inserting a step here
        if 'title: "5. Compare View (Side-by-Side Mode)"' in line:
            # insert new step 5 here
            new_lines.extend([
                '    {\n',
                f'      id: {step_idx},\n',
                f'      title: "{step_idx}. Granular Feedback & Caching",\n',
                '      elementId: "execute-enrich-btn",\n',
                '      tabRequirement: "pipeline",\n',
                '      description: "Run the pipeline again on the exact same input! Notice the Granular Progress bar that appears, stepping through \'Analyzing...\', \'Standardizing...\', and \'Validating...\'. Also notice the result appears instantly because of our LRU in-memory Server-Side Caching mechanism.",\n',
                '      expectedActionMessage: "Click the \'Run Pipeline\' button again to see the progress bar and fast cache retrieval.",\n',
                '      simulateAction: () => {\n',
                '        handleEnrich();\n',
                '      },\n',
                '      learnMoreTitle: "In-Memory Server-Side Caching & UX",\n',
                '      learnMoreMarkdown: `### Granular Execution Feedback\\nInstead of a generic loading spinner, the UI steps sequentially through actual pipeline phases.\\n\\n### LRU-style In-Memory Caching\\nWe implemented an air-gapped \\\`Map\\\`-based caching layer on the server (24h TTL). Redundant inferences (exact same manufacturer descriptions) return instantly, bypassing the model entirely and saving compute cycles, while maintaining strict data isolation (zero persistence in databases).`,\n',
                '    },\n'
            ])
            step_idx += 1
            
        elif 'title: "17. System Engine Settings"' in line:
            # insert new step 17 here
            new_lines.extend([
                '    {\n',
                f'      id: {step_idx},\n',
                f'      title: "{step_idx}. Monitor System Telemetry",\n',
                '      elementId: "tab-system-health",\n',
                '      tabRequirement: "system-health",\n',
                '      description: "Ensure enterprise-grade operational visibility. Switch to the \'System Health Dashboard\' tab on the left sidebar to monitor API latency, model confidence trends, and enrichment throughput.",\n',
                '      expectedActionMessage: "Click \'System Health Dashboard\' in the left navigation sidebar.",\n',
                '      simulateAction: () => {\n',
                '        setActiveTab("system-health");\n',
                '      },\n',
                '      learnMoreTitle: "Air-Gapped Telemetry & Observability",\n',
                '      learnMoreMarkdown: `### Enterprise Operational Visibility\\nThe System Health Dashboard is engineered strictly for pipeline monitoring and guarantees zero visibility into proprietary training datasets.\\nIt tracks:\\n- **API Latency & Confidence**: Real-time trends of execution speed and prediction certainty.\\n- **Throughput Profiling**: Total items processed per hour without referencing raw MRO descriptions or MPNs.`,\n',
                '    },\n'
            ])
            step_idx += 1

        # Now handle the current line updating
        match_id = re.search(r'^\s*id:\s*\d+,', line)
        match_title = re.search(r'^\s*title:\s*"\d+\.\s*(.+)",', line)
        
        if match_id:
            line = re.sub(r'id:\s*\d+', f'id: {step_idx}', line)
        if match_title:
            title_text = match_title.group(1)
            line = re.sub(r'title:\s*"\d+\.\s*.+",', f'title: "{step_idx}. {title_text}",', line)
            step_idx += 1
            
        if "];" in line and "const currentStep = tutorialSteps[currentStepIdx];" in "".join(lines[lines.index(line):lines.index(line)+3]):
            in_tutorial_steps = False

    new_lines.append(line)

with open('src/components/InteractiveTutorial.tsx', 'w') as f:
    f.writelines(new_lines)
