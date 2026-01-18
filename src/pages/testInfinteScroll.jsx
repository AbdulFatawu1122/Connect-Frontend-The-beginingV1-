import { useState, useEffect, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import FeedCardForProfile from "../components/feed-card-for-profile";



const BASE_URL = "http://192.168.8.114:8000";

function Testing() {
    const [FeedData, setFeeddata] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [LoadingInitial, setLoadingInitial] = useState(true);

    const fetchFeed = useCallback(async (pageNum) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch(`${BASE_URL}/posts/test-v1-feed?limit=2&page=${pageNum}`, {
                method: "Get",
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await  res.json();
            console.log(result)

            //Update data
            //If page 1, replace data, if page 2+, append data
            setFeeddata(prev => pageNum === 1 ? result.data : [...prev, ...result.data]);

            // Update hasMore
            setHasMore(result.hasMore)
            setLoadingInitial(false);
        } catch (error) {
            console.error("Fetch Error", error)
            setLoadingInitial(false);
        }
    }, []);

    useEffect(() => {
        fetchFeed(1);
    } ,[fetchFeed]);

    // Loading more
    const loadNextPage = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchFeed(nextPage)
    }
    return (
        <div>
            <h1>Your Feed</h1>

            {LoadingInitial ? (
                <p>Loading Initial Postss..</p>
            ) : (
                <InfiniteScroll
                dataLength={FeedData.length}
                next={loadNextPage}
                hasMore={hasMore}
                loader={<h4>Loading More Post</h4>}
                endMessage={<h1>You have Reach the end of posts</h1>}
                scrollThreshold={0.9}
                >
                    <div>
                        {FeedData.map((post) => {
                            return <FeedCardForProfile key={post.id}  feed={post}/>
                        })}
                    </div>
                </InfiniteScroll>
            )}
        </div>
    )
}


export default Testing


