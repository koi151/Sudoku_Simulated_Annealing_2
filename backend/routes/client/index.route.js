const homeRoutes = require("./home.route")
const rankingRoutes = require("./ranking.route")

module.exports = (app) => {  
  // app.use(categoryMiddleware.category);
  app.use("/api", homeRoutes);

  app.use("/api/ranking", rankingRoutes);
}