package utils

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/livekit/protocol/auth"
	"github.com/livekit/protocol/livekit"
	lksdk "github.com/livekit/server-sdk-go"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/models"
)

func GetJoinToken(c echo.Context, app *pocketbase.PocketBase) error {
	roomName := c.QueryParam("room")
	room, err := getRoom(c, app, roomName)
	if err != nil {
		return err
	}
	authRecord, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)
	at := auth.NewAccessToken(os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"))
	grant := &auth.VideoGrant{
		RoomJoin: true,
		Room:     room.Name,
	}
	at.AddGrant(grant).
		SetIdentity(authRecord.Id).
		SetValidFor(time.Duration(20) * time.Minute)
	token, _ := at.ToJWT()
	return c.String(http.StatusOK, token)
}

func getRoom(c echo.Context, app *pocketbase.PocketBase, name string) (*livekit.Room, error) {
	host := "http://localhost:7880"
	roomClient := lksdk.NewRoomServiceClient(host, os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"))
	rooms, _ := roomClient.ListRooms(context.Background(), &livekit.ListRoomsRequest{
		Names: []string{name},
	})
	if rooms == nil || len(rooms.GetRooms()) == 0 {
		room, err := createRooms(c, app, roomClient, name)
		if err != nil {
			return nil, err
		}
		return room, nil
	} else {
		room := rooms.GetRooms()[0]
		return room, nil
	}
}
func createRooms(c echo.Context, app *pocketbase.PocketBase, roomClient *lksdk.RoomServiceClient, name string) (*livekit.Room, error) {
	room, err := roomClient.CreateRoom(context.Background(), &livekit.CreateRoomRequest{
		Name:            name,
		EmptyTimeout:    2 * 60, // 2 minutes
		MaxParticipants: 2,
	})
	if err != nil {
		fmt.Print(err)
		return nil, apis.NewApiError(500, err.Error(), nil)
	}
	return room, nil
}
