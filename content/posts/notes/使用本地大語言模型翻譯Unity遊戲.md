---
title: 使用本地大語言模型翻譯Unity遊戲
description: ""
summary: 打破語言隔閡！！(๑•̀ㅂ•́)و✧
date: 2026-06-18
isCJKLanguage: "true"
categories: []
tags:
  - 心得
draft: false
---
## 一、給遊戲打插件

因為直接修改遊戲內的文字涉及的操作十分複雜，直接使用 AssetStudio、UABEA 等工具會被叫做手動翻譯而非機翻，所以先給遊戲打補丁。

這裡依賴一個插件叫做 [XUnity.AutoTranslator](https://github.com/bbepis/XUnity.AutoTranslator)。他可以用 MelonLoader 或 BepInEx 等 mod loader 安裝，由於我的遊戲使用 MelonLoader 無法成功識別文字，所以這裡使用 BepInEx。

BepInEx 根據遊戲的版本及編譯方式，分為多種情況。一般來說，可以先打最新的 BepInEx v5 版本，如果安裝失敗再考慮使用 v6 版本。 v6 版本主要會使用到兩個版本：Mono 與 IL2CPP。 Mono 版本很明顯在遊戲根目錄會有 `/MonoBleedingEdge` 資料夾； IL2CPP 則會有 `<game_name>_Data/il2cpp_data` 。

根據情況不同，去 [Releases](https://github.com/BepInEx/BepInEx/releases) 下載對應的版本，解壓縮到遊戲的根目錄，之後開啟一次遊戲。如果 `/BepInEx` 資料夾內有出現除了 `/core` 以外的資料夾，且 `LogOutput.log` 內沒有明顯報錯，表示安裝成功。

如果 IL2CPP 版本有類似以下報錯（翻找 `ErrorLog.log` 或 `LogOutput.log` ）： `Unsupported metadata version found! We support 23–31, got 38` ，則表示從 Releases 下載的 BepInEx 版本過舊，要從 [BepInBuilds](https://builds.bepinex.dev/projects/bepinex_be) 下載最新的 Build ，通常會安裝成功。

然後去 [XUnity.AutoTranslator/Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) 下載插件，然後解壓縮到 BepInEx 的對應資料夾內，但他很好心，幫我們創建好 BepInEx 資料夾，所以直接在根目錄解壓縮即可。

此時再次開啟遊戲，如果成功的話按下 `Alt+Num0` 會跳出一個視窗，表示安裝成功。接下來我們來架設語言模型。

## 二、架設大語言模型 API

市面上從日文翻譯成簡中或繁中的模型不多，主流是翻成英文，如果你可以接受英文那可以直接去玩遊戲了，因為 AutoTranslator 內建的翻譯就是用 Google 翻譯翻成英文。

我主要找到兩種模型： [Sugoi-14B-Ultra-GGUF](https://huggingface.co/sugoitoolkit/Sugoi-14B-Ultra-GGUF)、 [hakutaku/qwen2.5-ja-zh](https://huggingface.co/hakutaku/qwen2.5-ja-zh)。這兩個模型的基底都是使用 Qwen 調整來的，以下使用 Sugoi-14B，因為 qwen2.5-ja-zh 用在 Ollama 會出亂碼，似乎是在轉成 gguf 時沒做好，想要手動將 safetensor 轉成 gguf 可以參考 [llama.cpp](https://github.com/ggml-org/llama.cpp) 。

在電腦上先準備好 Ollama ，可以看著 [Quickstart](https://docs.ollama.com/quickstart) 安裝。從 HuggingFace 下載好 gguf 檔後要撰寫 ModelFile， Sugoi 的作者有提供教學 [Ollama with Sugoi LLM 14B/32B](https://blog.sugoitoolkit.com/sugoi-llm-14b-32b-with-ollama/) 。

但是照著做會發現你失敗了。因為在 HuggingFace 上，作者有提到需要更改 System Prompt。這裡提供作者的 Modelfile + 我的修改，讓模型能夠直接翻譯成簡中，可以直接複製。
```
# replace with correct <path>  
FROM Sugoi-14B-Ultra-Q4_K_M.gguf  
  
PARAMETER temperature 0.7  
PARAMETER num_ctx 4096  
PARAMETER top_k 40  
PARAMETER top_p 0.9  
  
TEMPLATE """{{- if .Messages }}  
{{- if or .System .Tools }}<|im_start|>system  
{{- if .System }}  
{{ .System }}  
{{- end }}  
{{- if .Tools }}  
  
# Tools  
  
You may call one or more functions to assist with the user query.  
  
You are provided with function signatures within <tools></tools> XML tags:  
<tools>  
{{- range .Tools }}  
{"type": "function", "function": {{ .Function }}}  
{{- end }}  
</tools>  
  
For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:  
<tool_call>  
{"name": <function-name>, "arguments": <args-json-object>}  
</tool_call>  
{{- end }}<|im_end|>  
{{ end }}  
{{- range $i, $_ := .Messages }}  
{{- $last := eq (len (slice $.Messages $i)) 1 -}}  
{{- if eq .Role "user" }}<|im_start|>user  
{{ .Content }}<|im_end|>  
{{ else if eq .Role "assistant" }}<|im_start|>assistant  
{{ if .Content }}{{ .Content }}  
{{- else if .ToolCalls }}<tool_call>  
{{ range .ToolCalls }}{"name": "{{ .Function.Name }}", "arguments": {{ .Function.Arguments }}}  
{{ end }}</tool_call>  
{{- end }}{{ if not $last }}<|im_end|>  
{{ end }}  
{{- else if eq .Role "tool" }}<|im_start|>user  
<tool_response>  
{{ .Content }}  
</tool_response><|im_end|>  
{{ end }}  
{{- if and (ne .Role "assistant") $last }}<|im_start|>assistant  
{{ end }}  
{{- end }}  
{{- else }}  
{{- if .System }}<|im_start|>system  
{{ .System }}<|im_end|>  
{{ end }}{{ if .Prompt }}<|im_start|>user  
{{ .Prompt }}<|im_end|>  
{{ end }}<|im_start|>assistant  
{{ end }}{{ .Response }}{{ if .Response }}<|im_end|>{{ end }}"""  
SYSTEM You are a professional localizer whose primary goal is to translate Japanese to Chinese. You should use colloquial or slang or nsfw vocabulary if it makes the translation more accurate. Always respond in Chinese.  
LICENSE """""""""""
```

因為 Sugoi 是用 Qwen 製作的， Qwen 主要在中文和日文表現較好，所以讓我們有一些操作空間，可以將 System Prompt 中指示翻譯成英文那段改成翻譯成中文。

成功用 Ollama 安裝後，可以測試一下輸入日文會不會輸出中文。如果沒問題，那麼進到下一步：撰寫翻譯插件。

## 三、撰寫翻譯插件
首先到 [XUnity.AutoTranslator/Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) 下載 Developer 版本，注意不要載成 IL2CPP 版本，會有一堆環境問題。撰寫插件的完整教學可以參考 [Implementing A Translator](https://github.com/bbepis/XUnity.AutoTranslator#implementing-a-translator) 。

我們專注在使用 Ollama API ，官方 API 文檔可以看 [Introduction](https://docs.ollama.com/api/introduction) 。

官方教學中提及最好將版本轉成 .Net Framework 3.5，這可以透過修改項目的 .csproj 文件達成，以下是我的 .csproj 檔：
```xml
<Project Sdk="Microsoft.NET.Sdk">  
  
  <PropertyGroup>  
    <TargetFramework>net35</TargetFramework>  
  </PropertyGroup>  
  
  <ItemGroup>  
    <Reference Include="XUnity.AutoTranslator.Plugin.Core">  
      <HintPath>path\to\XUnity.AutoTranslator.Plugin.Core.dll</HintPath>  
    </Reference>  
  </ItemGroup>  
  
</Project>
```

以及我的 Endpoint Class：

```cs
using SimpleJSON;  
using System;  
using System.Net;  
using XUnity.AutoTranslator.Plugin.Core.Endpoints;  
using XUnity.AutoTranslator.Plugin.Core.Endpoints.Http;  
using XUnity.AutoTranslator.Plugin.Core.Utilities;  
using XUnity.AutoTranslator.Plugin.Core.Web;  
  
public class OllamaTranslatorEndpoint : HttpEndpoint  
{  
  
    public override string Id => "OllamaTranslator";  
    public override string FriendlyName => "Ollama Local API Translator";  
  
    public int MaxConcurrency => 50;  
  
    public int MaxTranslationsPerRequest => 1;  
  
    private string endpoint = "http://localhost:11434/api/generate";  
  
    private int port;  
    private string model;  
  
    public override void Initialize(IInitializationContext context)  
    {  
        model = context.GetOrCreateSetting("Ollama", "Model", "");  
        if (model == "")  
        {  
            throw new Exception("The model name has not been provided.");  
        }  
  
        port = context.GetOrCreateSetting("Ollama", "Port", 11434);  
        endpoint = string.Format("http://localhost:{0}/api/generate", port);  
    }  
  
    public override void OnCreateRequest(IHttpRequestCreationContext context)  
    {  
        string payload = string.Format(  
            "{{\"model\": \"{0}\", \"prompt\": \"{1}\", \"stream\": false}}",  
            model,  
            JsonHelper.Escape(context.UntranslatedText)  
        );  
  
        var request = new XUnityWebRequest("POST", endpoint, payload);  
  
        request.Headers[HttpRequestHeader.ContentType] = "application/json; charset=utf-8";  
        request.Headers[HttpRequestHeader.Accept] = "application/json";  
  
        context.Complete(request);  
    }  
  
    public override void OnExtractTranslation(IHttpTranslationExtractionContext context)  
    {  
        if (HttpStatusCode.OK != context.Response.Code) context.Fail("Received bad response code: " + context.Response.Code);  
  
        string rawData = context.Response.Data;  
        var obj = JSON.Parse(rawData);  
  
        var translation = obj.AsObject["response"].Value;  
  
        if (string.IsNullOrEmpty(translation)) context.Fail("Received no translation.");  
  
        context.Complete(translation);  
    }  
}
```

建置好，把 dll 檔放到 `BepInEx/plugins/XUnity.AutoTranslator/Translators` ，並在 `BepInEx/config/AutoTranslatorConfig.ini` 最後加上幾行：

```toml
[Ollama]
Model=sugoi14b  
Port=11434
```

然後設定最前面改成：

```toml
[Service]  
Endpoint=OllamaTranslator  
FallbackEndpoint=  
  
  
[General]  
Language=zh  
FromLanguage=ja
```

打開遊戲應該，按下 `Alt+Num0` 應該會看到有一些翻譯正在執行中。注意需要打開 Ollama ，或者讓它保持在系統托盤中。到此一切正常的話，可以開始享受遊戲了，除了翻譯速度偏慢（在我的電腦上約 3 秒一句），其他沒什麼缺點。

## 四、缺字問題

如果開始遊玩後發現文字會出現□□□，就是代表遊戲用的 TMP 字型裡面缺字，一般的解決辦法需要用自訂的 TMP 來覆蓋上去。幸運的是我們是廣大的中文使用者，早就有人幫我們做好自訂的 TMP 字型，接下來我們要確認遊戲是用甚麼版本的 Unity 開發的。

找到 `<game_name>_Data/globalgamemanagers` 這個檔案，注意沒有副檔名。用隨便一個文字編輯器開啟，就在前幾行可以找到 Unity 的版本了，例如我的遊戲是 2022.3.62f2 版本。到 [Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.5.0) 下載 TMP 字體，解壓縮後將對應的版本放入遊戲根目錄，依我的版本我需要放 `arialuni_sdf_u2022` 這個檔案。

只要注意一點，以下兩個設定不能使用同一個字體，這樣會導致遊戲載入兩個一模一樣的檔案，字體會直接無法使用。也就是說，兩個裡面設定一個就好。

```toml
OverrideFontTextMeshPro=  
FallbackFontTextMeshPro=
```

如果很不幸的，就算使用官方替換字體也無法正常顯示（例如仍有缺字、文字消失、遊戲無法啟動等情況），那麼只剩下兩條路：一是尋找其他人製作的字體看能不能賭對版本，二是自己下載 Unity 製作字體。

第一條路這裡有：[sorrowmoil-MoeFont-for-XUnity.AutoTranslator](https://github.com/sorrowmoil/sorrowmoil-MoeFont-for-XUnity.AutoTranslator)、[记一次尝试汉化某游戏的悲催历程](https://bbs.pha.pub/threads/130/)

第二條路這裡有教學： [TextMeshPro Font Asset Creation & Packaging Guide](https://github.com/bbepis/XUnity.AutoTranslator/wiki/TextMeshPro-Font-Asset-Creation-&-Packaging-Guide)

## 五、缺字問題解決辦法

不過在我努力不懈的研究後，我找出一種穩定的解決方案。

首先要了解 Unity 是如何在 TextMeshPro 中顯示文字的。在遊戲製作的過程中，如果碰到缺字需要加上自訂字型，會透過 Font Asset Creator 的功能將 .ttf 或 .otf 等字型檔案轉成 TMP Font Asset。

TMP Font Asset 包含三個資訊：字型基本資訊、字體圖片、字符表。 Unity 會將 .ttf 中的文字資訊做成一張很大的 Texture2D 圖片，叫做 Atlas ，然後透過記錄甚麼字對應到圖片上的某塊區域，將他裁剪下來放到 TextBox 中。

所以要解決缺字，需要製作包含對應的缺字的 Font Asset ，或者製作一個包含大部分文字的 Font Asset ，很顯然後者比較方便製作。

然而，製作完 Font Asset 並嘗試使用 AutoTranslator 的字型替換功能後，卻跳出 NullPointerException ，原因不明，我也在 Github 上發了 [Issue](https://github.com/bbepis/XUnity.AutoTranslator/issues/853) ，不過還沒有人回我。

起初我以為是自己編譯的 Font Asset 的問題，所以嘗試了不同的編譯方式。之後我自己寫了插件去強制替換遊戲內的字型，大部分都失敗了，但卻讓我知道遊戲無法讀取 Font Asset 中的 Atlas 這塊資訊。

```
The Font Atlas Texture of the Font Asset NotoSansJP-Regular SDF assigned to Text (TMP) is missing.  
  UnityEngine.Logger:Log(LogType, Object, Object)  
  UnityEngine.Debug:LogWarning(Object, Object)  
  TMPro.TextMeshProUGUI:LoadFontAsset()  
  TMPro.TMP_Text:set_font(TMP_FontAsset)
```

不過，不論我如何更換載入 Font Asset 的方式，都無法解決這個問題。

所以自己一番研究後，我發現 Unity 加入了動態製作 Atlas 圖片的功能，如果有嘗試自己製作字型，就會發現每次製作的時間通常都要半小時以上，使用這個功能就不需要預先編譯字型，然後再載入到遊戲中。然而，在我編譯完動態載入字型時，遊戲卻又顯示同樣無法讀取 Atlas 的錯誤。

在爬 Unity API 的過程中， 我發現了 `[Font.CreateDynamicFontFromOSFont](https://docs.unity3d.com/2017.1/Documentation/ScriptReference/Font.CreateDynamicFontFromOSFont.html)` 。所以我想到，如果直接使用系統字型，那麼 Unity 就不需要從我們自己製作字型中的讀取，說不定可以跳過從檔案讀取 Atlas 這塊（因為 Atlas 是直接在記憶體中製作），並且在 Runtime 製作 Atlas ，省下了我們需要自己製作 Font Asset 的麻煩。

另外，我在 dnSpy 也發現了 `TMPFont.CreateFontAsset` 可以接受系統字型名稱，並創建動態字型。因此，透過參考 [xiaoye97/I18NFont4UnityGame](https://github.com/xiaoye97/I18NFont4UnityGame) 與逆向 [Font Changer](https://www.nexusmods.com/streetsofrogue/mods/14) ，我撰寫了一個適用於 BepInEx6 IL2CPP Bleeding Edge Build 的插件。以下是插件代碼：

```cs
using BepInEx;  
using BepInEx.Configuration;  
using BepInEx.Unity.IL2CPP;  
using HarmonyLib;  
using TMPro;  
using UnityEngine;  

namespace FontReplacer;
  
[BepInPlugin("my.fontreplacer", "Font Replacer", "0.0.1")]  
public class Plugin : BasePlugin  
{  
    public static TMP_FontAsset TMPTranslateFont;  
    public static ConfigEntry<string> SystemFontNameConfig;  
  
    public override void Load()  
    {  
        SystemFontNameConfig = Config.Bind<string>("config", "SystemFontName", "Microsoft YaHei", "Any Compatible Font Name Installed On Your System");  
        LoadFont();  
        Harmony.CreateAndPatchAll(typeof(Plugin));  
        Log.LogInfo("Font Replacer Plugin Loaded.");  
    }  
  
    public void LoadFont()  
    {  
        string userFontName = SystemFontNameConfig.Value;  
        string[] systemFontNames = Font.GetOSInstalledFontNames();  
        bool matched = false;  
        for (int i = 0; i < systemFontNames.Length; i++)  
        {  
            if (systemFontNames[i] == userFontName)  
            {  
                matched = true;  
            }  
        }  
  
        if (matched)  
        {  
            Log.LogInfo($"Confirmed font {userFontName} is installed.");  
            TMPTranslateFont = TMP_FontAsset.CreateFontAsset(userFontName, "");  
            Log.LogInfo($"TMP font asset created successfully.");  
        } else  
        {  
            Log.LogError($"Font {userFontName} is not installed on your system!");  
            Log.LogInfo("Please specify one font that exists in the following list:");  
            for (int i = 0; i < systemFontNames.Length; i++)  
            {  
                Log.LogInfo($"[{i}] {systemFontNames[i]}");  
            }  
        }  
    }  
  
    [HarmonyPostfix, HarmonyPatch(typeof(TextMeshProUGUI), "OnEnable")]  
    public static void TMPFontPatch(TextMeshProUGUI __instance)  
    {  
        if (TMPTranslateFont == null) return;  
  
        if (__instance.font != null && __instance.font.name != TMPTranslateFont.name)  
        {  
            __instance.font = TMPTranslateFont;  
        }  
    }  
}
```

測試環境：Windows 10 Pro 64bit、BepInEx6 IL2CPP 6.0.0-be.764、XUnity AutoTranslator 5.6.1。

使用方法：編譯後將 dll 放到 plugins 資料夾中，執行一次遊戲，config 資料夾會多出 `my.fontreplacer.cfg` 檔案，可以調整 SystemFontName 這項來更改要替換的系統字型，預設是微軟雅黑。

如果輸入的字體名稱無法正確讀取，插件會在 Log 輸出所有他看的到的系統字體，可以從裡面複製出來，目前我自己看起來覺得最舒服的是 SimSun （中易宋體）。

這個插件的缺點也很顯然，如果那個系統字型剛好只支持一種地區的文字，若遊戲內也剛好包含其他文字，文本一樣會顯示錯誤，不過我目前還沒遇過。

更新：我將這個插件的功能發 PR 到 AutoTranslator 了，可以去 github 複製 repo 下來自己編譯。