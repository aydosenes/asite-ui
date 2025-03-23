const { exec } = require("child_process");

exec("npm start", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error starting Next.js: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});