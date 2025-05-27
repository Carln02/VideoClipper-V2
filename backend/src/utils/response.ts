export function respondFailure(res: any, message: string = "Failure") {
    res.status(400);
    res.send(message);
}

export function respondSuccess(res: any, message: any = "Success") {
    res.status(200);
    res.send(message);
}