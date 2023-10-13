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
)

func GetJoinToken(c echo.Context, app *pocketbase.PocketBase) error {
	roomName := c.QueryParam("room")
	userName := c.QueryParam("name")
	room, err := getRoom(c, app, roomName)
	if err != nil {
		return err
	}
	at := auth.NewAccessToken(os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"))
	b := true
	grant := &auth.VideoGrant{
		RoomJoin:       true,
		CanPublishData: &b,
		Room:           room.Name,
	}
	at.AddGrant(grant).
		SetIdentity(userName).
		SetValidFor(time.Duration(20) * time.Minute)
	token, _ := at.ToJWT()
	response := &TokenResponse{
		Token: token,
	}
	return c.JSON(http.StatusOK, response)
}

func getRoom(c echo.Context, app *pocketbase.PocketBase, name string) (*livekit.Room, error) {
	host := os.Getenv("LIVEKIT_SERVER_URL")
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
		EmptyTimeout:    20 * 60, // 20 minutes
		MaxParticipants: 2,
	})
	if err != nil {
		fmt.Print(err)
		return nil, apis.NewApiError(500, err.Error(), nil)
	}
	return room, nil
}

type TokenResponse struct {
	Token string `json:"token"`
}
type BoolStruct struct {
	Value string `json:"value"`
}
