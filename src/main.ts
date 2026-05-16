import { renderLanding } from "./ui/landing";

const app = document.getElementById("app");
if (app) {
  renderLanding(app, (result) => {
    console.log("submit", result);
  });
}
