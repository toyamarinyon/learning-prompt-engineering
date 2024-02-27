import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { CheckIcon } from "lucide-react";
import { OpenAI } from "openai";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const prompt = formData.get("prompt");
  invariant(typeof prompt === "string", "prompt must be a string");
  const openai = new OpenAI({
    apiKey: context.cloudflare.env.OPENAI_API_KEY,
  });
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `ユーザーからの入力に最もあう色を答えてください。以下のように、ユーザーからの入力に続ける形で答えてください。
user: 空は
assistant: 青色
user: 海は
assistant: 青色
user: 草は
assistant: 緑色
user: 苺は
assistant: 赤色`,
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
  const [objective1, setObjective1] = useState(false);
  useEffect(() => {
    if (result?.assistant == null) {
      return;
    }
    setObjective1(true);
  }, [result]);
  return (
    <div className="flex h-screen flex-col divide-y overflow-y-hidden">
      <header className="flex h-12 items-center px-8 font-bold">
        読んで 書いて 使ってわかるプロンプトエンジニアリング
      </header>
      <main className="flex flex-1 divide-x">
        <div className="w-[400px] shrink-0 space-y-8 p-8">
          <section>
            <p>
              「
              <strong>
                読んで 書いて 使ってわかるプロンプトエンジニアリング
              </strong>
              」
              へようこそ！このレッスンでは、プロンプトエンジニアリングの概念や、その実装方法について学ぶことができます。
            </p>
          </section>
          <section>
            <h2 className="py-4 text-xl">レッスン1: 空は？</h2>
            <p>
              まずは、シンプルなプロンプトから始めましょう。右の
              <Label htmlFor="prompt">
                <Badge className="mx-1">プロンプト</Badge>
              </Label>
              と書かれているテキストエリアに
              <span className="bg-muted rounded px-2 py-0.5">空は</span>
              と入力して
              <Button className="mx-1" size={"inline"}>
                結果を確認
              </Button>
              ボタンを押してみましょう。
            </p>
          </section>
        </div>
        <Form className="flex w-full flex-col divide-y" method="post">
          <div className="h-full">
            <div className="flex h-full flex-col divide-y">
              <div className="flex-1 p-8">
                <Label htmlFor="prompt" className="mb-1 block">
                  <Badge>システムプロンプト</Badge>
                </Label>
                <textarea
                  id="system"
                  name="system"
                  placeholder="レッスン6に進むとここが使えるようになります"
                  className="h-full w-full cursor-not-allowed resize-none outline-none"
                  readOnly
                ></textarea>
              </div>
              <div className="flex-1 p-8">
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
            </div>
          </div>
          <div className="p-8">
            <Button type="submit" disabled={navigation.state === "submitting"}>
              結果を確認
            </Button>
          </div>
        </Form>
        <div className="w-[400px] shrink-0 p-8">
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
          <Card className="mt-6">
            <CardContent className="pt-4">
              <p className="mb-2 font-bold">目標</p>
              <div className="flex items-center">
                <CheckIcon
                  className={cn("mr-2 h-5 w-5", {
                    "text-zinc-300": !objective1,
                    "text-zinc-700": objective1,
                  })}
                />
                <p>
                  <Badge className="mr-1">結果</Badge>に青色と表示される
                </p>
              </div>
              {objective1 && (
                <div className="mt-2 rounded bg-zinc-100 p-4">
                  <p>
                    いいですね。このように、入力された文章の続きを生成するのが生成AIの基本的な使い方です。
                  </p>
                  <p>
                    そして、生成内容を調整する技法がプロンプトエンジニアリングです。次のレッスンではもう少し抽象的な内容を生成してみましょう。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
