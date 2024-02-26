import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { OpenAI } from "openai";
import invariant from "tiny-invariant";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const prompt = formData.get("prompt");
  invariant(typeof prompt === "string", "prompt must be a string");
  const openai = new OpenAI({
    apiKey: context.env.OPENAI_API_KEY,
  });
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `ユーザーからの入力に最もあう色を答えてください。以下のように、ユーザーからの入力に続ける形で答えてください。
user: 空は
assistant: 青色です。
user: 海は
assistant: 青色です。
user: 草は
assistant: 緑色です。`,
      },
      { role: "user", content: prompt },
    ],
    model: "gpt-3.5-turbo",
  });
  const assistant = completion.choices[0].message.content;
  return json({ assistant });
};

export default function Index() {
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  return (
    <div className="flex h-screen flex-col divide-y overflow-y-hidden">
      <header className="flex h-8 items-center px-8">
        Learn Prompt Engineering
      </header>
      <main className="flex flex-1 divide-x">
        <div className="w-[400px] shrink-0 space-y-8 p-8">
          <section>
            <p>
              プロンプト
              エンジニアリングチュートリアルへようこそ！このチュートリアルでは、プロンプトエンジニアリングの概念や、その実装方法について学ぶことができます。このチュートリアルを通じて、プロンプトエンジニアリングを使って、高性能で小さなフットプリントのウェブアプリケーションを簡単に構築する方法を学ぶことができます。
            </p>
          </section>
          <section>
            <h2 className="py-4 text-xl">レッスン1: 空は？</h2>
            <p>
              まずは、シンプルなプロンプトから始めましょう。右の「プロンプト」と書かれているテキストエリアに
              <span className="bg-muted rounded px-2 py-0.5">空は</span>
              と入力して「結果を確認」ボタンを押してみましょう。
            </p>
          </section>
        </div>
        <Form className="flex w-full flex-col divide-y" method="post">
          <div className="h-full p-8">
            <Label htmlFor="prompt" className="mb-1 block">
              <Badge>プロンプト</Badge>
            </Label>
            <textarea
              id="prompt"
              name="prompt"
              placeholder="ここに入力してください。"
              className="h-full w-full resize-none outline-none"
            ></textarea>
          </div>
          <div className="p-8">
            <Button type="submit" disabled={navigation.state === "submitting"}>
              結果を確認
            </Button>
          </div>
        </Form>
        <div className="w-[400px] p-8">
          <div className="mb-1">
            <Badge>結果</Badge>
          </div>
          {navigation.state === "submitting" ? (
            <p>結果を確認中...</p>
          ) : result?.assistant == null ? (
            <p>
              プロンプトを入力し、結果を確認を押すとここに結果が表示されます。
            </p>
          ) : (
            <p>{result.assistant}</p>
          )}
        </div>
      </main>
    </div>
  );
}
