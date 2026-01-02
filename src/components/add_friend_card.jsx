function AddFriendCard(user) {
        <div className="card">
            <div className="pro-img">

            </div>
            <div className="info">
                {user.firstname}, {user.lastname}
            </div>
            <div className="add-button">
                <button>Add Friend</button>
            </div>
        </div>
}


export default AddFriendCard