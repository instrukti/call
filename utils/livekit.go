package utils

import (
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/livekit/protocol/auth"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/models"
)

func GetJoinToken(c echo.Context, app *pocketbase.PocketBase) error {
	authRecord, _ := c.Get(apis.ContextAuthRecordKey).(*models.Record)
	at := auth.NewAccessToken(os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"))
	grant := &auth.VideoGrant{
		RoomJoin: true,
		Room:     "Demo Room",
	}
	at.AddGrant(grant).
		SetIdentity(authRecord.Id).
		SetValidFor(time.Duration(20) * time.Minute)
	token, _ := at.ToJWT()
	return c.String(http.StatusOK, token)
}

// func GetRoom(c echo.Context, app *pocketbase.PocketBase) (*livekit.Room, error) {
// 	host := "http://localhost:7880"
// 	roomClient := lksdk.NewRoomServiceClient(host, os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"))
// 	rooms, _ := roomClient.ListRooms(context.Background(), &livekit.ListRoomsRequest{})
// 	if rooms == nil || len(rooms.GetRooms()) == 0 {
// 		err := CreateRooms(c, app, roomClient)
// 		if err != nil {
// 			return nil, err
// 		}

// 	} else {
// 		fmt.Print(rooms.GetRooms()[0])
// 	}
// 	return nil, nil
// }
// func CreateRooms(c echo.Context, app *pocketbase.PocketBase, roomClient *lksdk.RoomServiceClient) error {
// 	_, err := roomClient.CreateRoom(context.Background(), &livekit.CreateRoomRequest{
// 		Name:            "Demo Room",
// 		EmptyTimeout:    2 * 60, // 2 minutes
// 		MaxParticipants: 2,
// 	})
// 	if err != nil {
// 		fmt.Print(err)
// 		return apis.NewApiError(500, err.Error(), nil)
// 	}
// 	return nil
// }
