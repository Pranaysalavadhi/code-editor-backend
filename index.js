// backend/index.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/run", async (req, res) => {
  const { code, input } = req.body;

  const jobId = uuidv4();
  const codeFile = `code-${jobId}.py`;
  const inputFile = `input-${jobId}.txt`;

  try {
    // Save code and input to files
    fs.writeFileSync(codeFile, code);
    fs.writeFileSync(inputFile, input || "");

    // Run Python locally (NO Docker)
    const command = `python ${codeFile} < ${inputFile}`;

    exec(command, (err, stdout, stderr) => {
      // Clean up
      fs.unlinkSync(codeFile);
      fs.unlinkSync(inputFile);

      if (err) {
        return res.json({ output: stderr || err.message });
      }
      return res.json({ output: stdout });
    });
  } catch (err) {
    return res.status(500).json({ output: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
