import { IModify } from '@rocket.chat/apps-engine/definition/accessors';
import {IRoom} from '@rocket.chat/apps-engine/definition/rooms';
import {IUser} from '@rocket.chat/apps-engine/definition/users';

export async function notifyError(room: IRoom, user: IUser, msg: string, modify: IModify) {
    const msgBuilder = modify
        .getCreator()
        .startMessage()
        .setSender(user)
        .setRoom(room)
        .setText(msg);

    await modify
        .getNotifier()
        .notifyUser(
            user,
            msgBuilder.getMessage(),
        );
}
