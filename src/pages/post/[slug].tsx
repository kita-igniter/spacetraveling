import { GetStaticPaths, GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from "../../components/Header";
import Head from "next/head";
import { FiCalendar, FiUser, FiClock} from "react-icons/fi";
import { format } from "date-fns";
import ptBr from "date-fns/locale/pt-BR";
import { RichText } from "prismic-dom";
import Image from "next/image";
import { useRouter } from "next/router";

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }:PostProps) {
  
  function TimeToRead() {
    const words = post.data.content.reduce((acc, data) => {
      acc = acc + RichText.asText(data.body).split(" ").length + data.heading.split(" ").length;
      return acc;
    }, 0);
    const time = Math.ceil(words / 200);
    return String(time).concat(" min");
  }

  const { isFallback } = useRouter();
  return !isFallback ? (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>
      <Header />
      <section className={styles.banner}>
        <div>
          <img src={post.data.banner.url} alt={post.data.title}/>
        </div>
      </section>
      <section>
        <main className={commonStyles.container}>
          <div className={styles.title}>
            <h1>{post.data.title}</h1>
            <div className={styles.info}>
              <div>
                <FiCalendar/>
                <span>
                  {format(
                    new Date(post.first_publication_date),
                  "d LLL y", 
                  {
                    locale: ptBr,
                  })}
                </span>
              </div>
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
              <div>
                <FiClock />
                <span>{ TimeToRead() }</span>
              </div>
            </div>
          </div>
          {post.data.content.map(content => (
            <div className={styles.content} key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}} 
              />
            </div>
          ))}
        </main>
      </section>
    </>
  ) : (
    <div className={styles.loading}>
      <Image 
        src="/loading-spin.svg.svg"
        alt="logo"
        width="auto"
        height="auto"
      />
      <span>Carregando...</span>
    </div>
  );  
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType("posts", {
    pageSize: 2,
  });

  const slugs = posts.results.map(data => {
    return {
      params: {
        slug: data.uid,
      },
    };
  });

  return {
    paths: slugs, 
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({params}) => {

  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID("posts", String(slug));

  const content = response.data.content.map(content => {
    const data = {
      "heading": content.heading,
      "body":  content.body,
    };
    return (
      data
    );
  });

  const data = {
    title: response.data.title,
    subtitle: response.data.subtitle,
    banner: {
      "url": response.data.banner.url
    },
    author: response.data.author,
    content: content,
  };

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: data,
  };
 
  return {
    props: {
      post
    }
  }
};
