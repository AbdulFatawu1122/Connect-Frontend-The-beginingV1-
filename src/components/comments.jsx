import styles from "../css/comments.module.css";
import TimeAgo from "react-timeago";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";


function CommentsBoxComponent(comments) {

   
    const JusNowCalculator = (timestamp) => {
        const currentTime = new Date();
        const timeCreated = new Date(timestamp);
        const reminder_milicons = currentTime - timeCreated;
        if (reminder_milicons <= 60000) {
            return "Just Now";
        }
        else {
            return <TimeAgo date={timestamp}/>
        }
    }

    return (
        <div className={styles.CommentCard} key={comments.comments.comment.id}>
            <div className={styles.SignleComment}>
                <div className={styles.CommeterProfile}>
                    <div className={styles.CommenterProfilePicture}></div>
                    <div className={styles.CommenterName}>
                        <h3>
                            <Link to={`/user/${comments.comments.commenter.id}`}>
                            {comments.comments.commenter.firstname}{" "}
                            {comments.comments.commenter.lastname}
                            </Link>
                        </h3>
                    </div>

                    <div className={styles.CommentPostedTime}>
                         <p>
                            {JusNowCalculator(comments.comments?.comment?.time_created)}
                         </p>
                    </div>
                </div>
                <div className={styles.CommenterComment}>
                    <p>{comments.comments.comment.comment}</p>
                </div>
                <hr />
            </div>

        </div>
    );
}

export default CommentsBoxComponent;
