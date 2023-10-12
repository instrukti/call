package main

import (
	"log"
	"net/http"

	"github.com/instrukti/call/ui"
	"github.com/instrukti/call/utils"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	app := pocketbase.New()
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/*", apis.StaticDirectoryHandler(ui.DistDirFS, false))
		e.Router.AddRoute(echo.Route{
			Method: http.MethodGet,
			Path:   "/api/getJoinToken",
			Handler: func(c echo.Context) error {
				return utils.GetJoinToken(c, app)
			},
			Middlewares: []echo.MiddlewareFunc{
				apis.ActivityLogger(app),
			},
		})
		return nil
	})
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
