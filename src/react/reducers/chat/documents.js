import { actionTypes } from "../../actions/actionTypes";
import _ from "lodash";

export const initialState = [];

/**
 * @param state
 * @param action
 * @returns {[]|*[]}
 */
const documents = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.CREATE_DOCUMENT:
      return [...state, action.document];

    case actionTypes.UPDATE_DOCUMENT:
      // Modify data of user with same id.
      return state.map(document =>
        document.id === action.id
          ? _.merge({}, document, { ...action.data })
          : document
      );

    case actionTypes.DELETE_DOCUMENT:
      return state.filter(document => document.id !== action.id);

    default:
      return state;
  }
};

export default documents;

export const selectDocument = (state, id) =>
  state.find(document => document.id === id);
