import TimeAgo from "react-timeago";
import styles from "../css/feed_card_for_profile.module.css";
import { Link } from "react-router-dom";
import ReactPlayer from "react-player"
import {useInView} from "react-intersection-observer"

const BASE_URL = "http://192.168.8.114:8000";

function FeedCardForProfile({ feed }) {

  return (
    <div className={styles.post_card}>
      <div className={styles.card_container}>
        <div className={styles.profile}>
          <div className={styles.profile_image}></div>
          <div className={styles.info}>
            <div className={styles.profile_name_time}>
              <p className={styles.name}>
                <Link style={{textDecoration:"none"}} to={`/user/${feed.user.id}`}>{feed.user.firstname} {feed.user.lastname}</Link>
              </p>
              <p className={styles.time_ago}>
                <TimeAgo date={feed.time_created} />
              </p>
            </div>
          </div>
          <div className={styles.firend_stats}>
            {feed.is_friends === "friend" ? (
              <p style={{ color: "red" }}>Friends</p>
            ) : feed.is_friends == "not friend" ? (
              <p style={{ color: "red" }}>Not Friends!</p>
            ) : (
              <p style={{ color: "red" }}>You</p>
            )}
          </div>
        </div>
        <div className={styles.post_description}>
          <p>{feed.post_description}</p>
        </div>
        <div className={styles.post_media}>
          {feed.media.map((media) => {
            const IsImage = media.filetype === "image";

            return IsImage ? (
              <img
                key={media.id}
                src={`${BASE_URL}/src/uploads/${media.filename}`}
                loading="lazy"
              />
            ) : (
              <video
                controls
                key={media.id}
                src={`${BASE_URL}/src/uploads/${media.filename}`}
                loading="lazy"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FeedCardForProfile;
