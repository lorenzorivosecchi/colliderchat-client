import { connect } from "react-redux";
import UserList from "./UserList";
import { selectUsers } from "../../reducers/root";
import { displayUser } from "../../actions/displayUser";

const mapDispatchToProps = dispatch => ({
  displayUser: userId => dispatch(displayUser(userId))
});

const mapStateToProps = state => ({
  displayedUser: state.base.displayedUser,
  myUserId: state.base.myUserId,
  users: selectUsers(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
