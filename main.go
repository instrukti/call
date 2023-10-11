package main

import (
	"log"

	"github.com/instrukti/call/ui"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
	app := pocketbase.New()
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/*", apis.StaticDirectoryHandler(ui.DistDirFS, false))
		return nil
	})
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
