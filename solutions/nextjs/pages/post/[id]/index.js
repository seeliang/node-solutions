import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const Post = () => {
  const [content, setContent] = useState('');
  const router = useRouter();
  const { id } = router.query;
  useEffect(() => {
    if (!id) {
      return;
    }
    console.log(id);
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setContent(JSON.stringify(data));
      });
  }, [id]);

  return <><h1>You have post word: {id} </h1> <p>{content}</p></>;
};

export default Post;
