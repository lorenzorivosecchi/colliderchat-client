import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { actionTypes } from "../../../../actions/actionTypes";
import {
  generateUserId,
  s_loginResponseSaga
} from "../../../../sagas/server/responses/loginResponse";
import { testFunction } from "../../../../utils/testing";

describe("s_loginResponse saga", () => {
  describe("when everything is alright", () => {
    let saga;
    const clientId = 0;
    const userId = 1;
    const userData = { foo: "bar" };
    const newUser = {
      ...userData,
      id: userId
    };

    beforeEach(() => {
      saga = expectSaga(s_loginResponseSaga, clientId, userData)
        .withState({
          server: {
            clients: [{ id: 0, userId }],
            status: {
              authRequired: false
            }
          },
          client: {
            users: [{ id: 1 }]
          }
        })
        .provide([[matchers.call.fn(generateUserId), userId]]);
    });

    it("should broadcast the new user", () => {
      return saga
        .put({
          type: actionTypes.S_BROADCAST,
          clientId,
          message: {
            type: actionTypes.B_USER_JOINED,
            userId,
            userData: newUser
          }
        })
        .run();
    });

    it("should transmit a success message", () => {
      return saga
        .put({
          type: actionTypes.S_TRANSMIT,
          clientId,
          message: {
            type: actionTypes.S_LOGIN_SUCCESS,
            userId
          }
        })
        .run();
    });
  });
  describe("when authentication is required", () => {
    const clientId = 0;
    const userData = {};
    const password = "test";

    it("should send a success message when password is correct", () => {
      return expectSaga(s_loginResponseSaga, clientId, userData, password)
        .withState({
          server: {
            clients: [{ id: clientId }],
            status: {
              password,
              authRequired: true
            }
          }
        })
        .put.like({
          action: {
            type: actionTypes.S_TRANSMIT,
            clientId,
            message: {
              type: actionTypes.S_LOGIN_SUCCESS
            }
          }
        })
        .run();
    });

    it("should send en error 403 when given password is empty", () => {
      return expectSaga(s_loginResponseSaga, clientId, userData, undefined)
        .withState({
          server: {
            clients: [{ id: clientId }],
            status: {
              password,
              authRequired: true
            }
          }
        })
        .put.like({
          action: {
            type: actionTypes.S_TRANSMIT,
            clientId,
            message: {
              type: actionTypes.S_LOGIN_ERROR,
              error: { status: 403 }
            }
          }
        })
        .run();
    });

    it("should send an error 403 when password is incorrect", () => {
      return expectSaga(s_loginResponseSaga, clientId, userData, "foo")
        .withState({
          server: {
            clients: [{ id: clientId }],
            status: {
              password,
              authRequired: true
            }
          }
        })
        .put.like({
          action: {
            type: actionTypes.S_TRANSMIT,
            clientId,
            message: {
              type: actionTypes.S_LOGIN_ERROR,
              error: { status: 403 }
            }
          }
        })
        .run();
    });

    it("should send en error 500 when server password is empty", () => {
      return expectSaga(s_loginResponseSaga, clientId, userData, password)
        .withState({
          server: {
            clients: [{ id: clientId }],
            status: {
              authRequired: true
            }
          }
        })
        .put.like({
          action: {
            type: actionTypes.S_TRANSMIT,
            clientId,
            message: {
              type: actionTypes.S_LOGIN_ERROR,
              error: { status: 500 }
            }
          }
        })
        .run();
    });
  });
  describe("when an error is raised", () => {
    it("should transmit an error 500 message to the client", () => {
      const clientId = 0;
      const error = new Error("test");
      return expectSaga(s_loginResponseSaga, clientId)
        .provide([[matchers.call.fn(testFunction), throwError(error)]])
        .put.like({
          action: {
            type: actionTypes.S_TRANSMIT,
            clientId,
            message: {
              type: actionTypes.S_LOGIN_ERROR,
              error: { status: 500 }
            }
          }
        })
        .run();
    });
  });
});
