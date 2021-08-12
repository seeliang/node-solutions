import { useRouter } from 'next/router';

const Post = () => {
  const router = useRouter();
  const { id } = router.query;
  console.log(id);
  return <h1>You have reached Post: {id} </h1>;
};

export default Post;
