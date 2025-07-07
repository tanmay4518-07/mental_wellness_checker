let pyodideReadyPromise = loadPyodide();

document.getElementById("quizForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const answers = {};
  for (let i = 1; i <= 10; i++) {
    answers[`q${i}`] = document.querySelector(`select[name='q${i}']`).value;
  }

  let pyodide = await pyodideReadyPromise;

  const response = await fetch("wellness_logic.py");
  const pythonCode = await response.text();
  await pyodide.runPythonAsync(pythonCode);

  for (let key in answers) {
    pyodide.globals.set(key, answers[key]);
  }

  const result = pyodide.runPython(`
calculate_wellness_score(q1, q2, q3, q4, q5, q6, q7, q8, q9, q10)
  `);

  document.getElementById("result").innerText = result;
});
