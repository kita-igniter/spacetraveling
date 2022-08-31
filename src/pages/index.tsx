import { useState } from "react";
import Header from "../components/Header";
import Head from "next/head";
import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from "react-icons/fi";
import { format } from "date-fns";
import ptBr from "date-fns/locale/pt-BR";
import Link from "next/link";

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  //console.log("PostPagination", postsPagination); formato
  const [nextpage, setNextpage] = useState(postsPagination.next_page);
  const [post, setPost] = useState(postsPagination.results);

  async function getNextPage() {
    let data = {} as PostPagination;

    await fetch(postsPagination.next_page)
      .then(res => res.json())
      .then(res => data = {
        next_page: res.next_page,
        results: res.results,
      });

    const nextPost = await data.results.map(post => {
      return ({
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      });
    });

    nextPost.forEach((data) => {
      const getPost = {
        uid: data.uid,
        first_publication_date: data.first_publication_date,
        data: {
          author: data.data.author,
          subtitle: data.data.subtitle,
          title: data.data.title,
        }
      };

      setPost(post => [...post, getPost]);
    });

    setNextpage(data.next_page);
  }

  return (
    <>
      <Head>
        <title>SpaceTraveling | Home</title>
      </Head>
      <Header />
      <main className={commonStyles.container}>
        {post.map(post => (
          <Link href={"/post/"+post.uid} key={post.uid}>
            <a className={styles.post}>
              <div>
                <h1>{post.data.title}</h1>
                <span>{post.data.subtitle}</span>
              </div>
              <div className={styles.info}>
                <div>
                  <FiCalendar />
                  <span>{
                     format(
                      new Date(post.first_publication_date),
                      "d LLL y",
                      {
                        locale: ptBr,
                      }
                    )
                  }</span>
                </div>
                <div>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}
        <div className={styles.moreposts}>
          {nextpage != null ? (
            <a onClick={getNextPage}>Carregar mais posts</a>
          ) : (
            <a>Posts ended!</a>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType("posts", {
    pageSize: 2,
  });

  const post = postsResponse.results.map<Post>(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: post,
  };

  return {
    props: {
      postsPagination
    }
  }
};
