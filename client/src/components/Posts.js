import React from 'react';
import Post from './Post';

const Posts=({posts, setPosts})=>{
    const renderPosts = () => {
        return posts.map((post, index) => {
          let key =
            Date.now() + "-" + Math.round(Math.random() * 100) + "-" + index;
          return <Post key={key} post={post} posts={posts} setPosts={setPosts} />;
        });
      };

    return(
        <div className="feed">{renderPosts()}</div>
    )
}
export default Posts;