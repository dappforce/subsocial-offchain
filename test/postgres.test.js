const queries = require('./queries/queries.ts')

const {compareData, hash} = require('./compare-data')

expect.extend({
  ToBeMatch(expect, toBe, Msg) {
    //Msg is the message you pass as parameter
    const pass = expect === toBe;
    if (pass) {
      //pass = true its ok
      return { pass: pass }
    } else {
      //not pass
      return { pass: pass, message: () => Msg }
    }
  }
});

test("Test for activity table should be successful", async () => {
  const {inputData, outputData, msg} = await compareData("activities.csv", queries.selectFromActivities)
  expect(inputData).ToBeMatch(outputData, msg);
});

test("Test for notification table should be successful", async () => {
  const {inputData, outputData, msg} = await compareData("notifications.csv", queries.selectFromNotifications)
  expect(inputData).ToBeMatch(outputData, msg);
});

test("Test for news_feed table should be successful", async () => {
  const {inputData, outputData, msg} = await compareData("news_feed.csv", queries.selectFromNewsFeed)
  expect(inputData).ToBeMatch(outputData, msg);
});

test("Test for account_followers table should be successful", async () => {
  const {inputData, outputData, msg} = await compareData("account_followers.csv", queries.selectFromAccountFollowers)
  expect(inputData).ToBeMatch(outputData, msg);
});

test("Test for comment_followers table should be successful", async () => {
  const {inputData, outputData, msg} = await compareData("comment_followers.csv", queries.selectFromCommentFollowers)
  expect(inputData).ToBeMatch(outputData, msg);
});

test("Test for post_followers table should be successful", async () => {
  const {inputData, outputData, msg} = await compareData("post_followers.csv", queries.selectFromPostFollowers)
  expect(inputData).ToBeMatch(outputData, msg);
});

test("Test for space_folowers table should be successful", async () => {
  const {inputData, outputData, msg} = await compareData("space_followers.csv", queries.selectFromSpaceFollowers)
  expect(inputData).ToBeMatch(outputData, msg);
});