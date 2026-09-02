import { faker } from "@faker-js/faker";
import { BADGE_CATALOG, type Comment, type CommentUser, type Reply } from "../../src/components/comment-data";

export const DEMO_USER: CommentUser = {
  name: "Guest User",
  avatar: "/placeholder.svg?height=36&width=36",
};

const BADGE_IDS = BADGE_CATALOG.map((b) => b.id);
const COMMENT_COUNT = 48;

function fakeUser(): { name: string; avatar: string } {
  return {
    name: faker.person.fullName(),
    avatar: faker.image.avatarGitHub(),
  };
}

function fakeVotes(likeProbability: number): { liked: boolean; disliked: boolean } {
  const liked = faker.datatype.boolean({ probability: likeProbability });
  return {
    liked,
    disliked: liked ? false : faker.datatype.boolean({ probability: 0.08 }),
  };
}

function fakeReply(parentName: string, after: Date): Reply {
  const user = fakeUser();
  const votes = fakeVotes(0.12);
  return {
    id: faker.string.uuid(),
    name: user.name,
    avatar: user.avatar,
    text: faker.lorem.sentence({ min: 4, max: 18 }),
    likes: faker.number.int({ min: 0, max: 2000 }),
    liked: votes.liked,
    disliked: votes.disliked,
    timestamp: faker.date.between({ from: after, to: new Date() }).toISOString(),
    replyingTo: parentName,
    subscription: faker.helpers.maybe(() => faker.helpers.arrayElement(["pro", "max"] as const), {
      probability: 0.25,
    }),
    image: faker.helpers.maybe(
      () => faker.image.urlPicsumPhotos({ width: 300, height: 200 }),
      { probability: 0.08 },
    ),
    sticker: faker.helpers.maybe(
      () => faker.image.urlPicsumPhotos({ width: 80, height: 80 }),
      { probability: 0.1 },
    ),
  };
}

function fakeComment(index: number): Comment {
  const user = fakeUser();
  const created = faker.date.recent({ days: 14 });
  const replyCount = faker.number.int({ min: 0, max: 5 });
  const replies: Reply[] = [];
  for (let j = 0; j < replyCount; j += 1) {
    replies.push(fakeReply(j === 0 ? user.name : replies[j - 1].name, created));
  }
  const votes = fakeVotes(0.15);

  return {
    id: faker.string.uuid(),
    name: user.name,
    avatar: user.avatar,
    text: faker.lorem.sentences({ min: 1, max: 3 }),
    likes: faker.number.int({ min: 0, max: 40_000 }),
    liked: votes.liked,
    disliked: votes.disliked,
    timestamp: created.toISOString(),
    pinned: index === 0,
    replies,
    subscription: faker.helpers.maybe(() => faker.helpers.arrayElement(["pro", "max"] as const), {
      probability: 0.3,
    }),
    badges: faker.helpers.maybe(
      () => faker.helpers.arrayElements(BADGE_IDS, { min: 1, max: 3 }),
      { probability: 0.45 },
    ),
    image: faker.helpers.maybe(
      () => faker.image.urlPicsumPhotos({ width: 400, height: 300 }),
      { probability: 0.12 },
    ),
    sticker: faker.helpers.maybe(
      () => faker.image.urlPicsumPhotos({ width: 80, height: 80 }),
      { probability: 0.1 },
    ),
  };
}

function collectAuthorNames(comments: Comment[]): string[] {
  const names = new Set<string>();
  for (const comment of comments) {
    names.add(comment.name);
    for (const reply of comment.replies) names.add(reply.name);
  }
  return [...names];
}

function injectMentions(comments: Comment[]) {
  const authors = collectAuthorNames(comments);
  if (authors.length < 2) return;

  for (const comment of comments) {
    const threadNames = [comment.name, ...comment.replies.map((r) => r.name)];
    const commentOthers = [...new Set(threadNames.filter((name) => name !== comment.name))];
    const fallbackOthers = authors.filter((name) => name !== comment.name);
    const commentPool = commentOthers.length > 0 ? commentOthers : fallbackOthers;
    if (commentPool.length > 0 && faker.datatype.boolean({ probability: 0.4 })) {
      comment.text = `@${faker.helpers.arrayElement(commentPool)} ${comment.text}`;
    }
    for (const reply of comment.replies) {
      const replyOthers = [...new Set(threadNames.filter((name) => name !== reply.name))];
      if (replyOthers.length > 0 && faker.datatype.boolean({ probability: 0.45 })) {
        reply.text = `@${faker.helpers.arrayElement(replyOthers)} ${reply.text}`;
      }
    }
  }
}

export function seedComments(): Comment[] {
  faker.seed(42);
  const comments: Comment[] = [];
  for (let i = 0; i < COMMENT_COUNT; i += 1) {
    comments.push(fakeComment(i));
  }
  injectMentions(comments);
  return comments;
}
