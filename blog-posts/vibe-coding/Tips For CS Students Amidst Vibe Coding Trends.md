## TOC

{%- # TOC start (generated with https://github.com/derlin/bitdowntoc) -%}

- [TOC](#toc)
- ["Why Should I join CS When Code Can Be Easily Vibed 🏄‍♂️ ?"](#why-should-i-join-cs-when-code-can-be-easily-vibed-️-)
  - ["Problem Complexity?"](#problem-complexity)
  - ["Ok, So Does The AI *Vibe* ✨ With All of These Levels?"](#ok-so-does-the-ai-vibe--with-all-of-these-levels)
- [Footnotes](#footnotes)
- [If you Have Any Questions/Suggestions...](#if-you-have-any-questionssuggestions)
- [And If I made a mistake](#and-if-i-made-a-mistake)

{%- # TOC end -%}

&nbsp;

This post acts a survival guide for CS students who are currently in the middle of the "Vibe Coding" wave 🌊.

Actually, I'll phrase this post in a question-answer format while assuming that you are a pessimistic CS student who is not *vibing* with the current AI trends.


## "Why Should I join CS When Code Can Be Easily Vibed 🏄‍♂️ ?"

First of all, what "code" are you talking about?

You "code" to accomplish a "task". I.e., a "problem" that you want to solve.

These "problems" *can* be categorized into multiple levels of complexity...

### "Problem Complexity?"

Yes, here's a simple categorization of the problems that an average dev. faces ([fn.1]): 

1. **Simple isolated problems** (`lvl1`): These are the problems that can be *usually* solved using a single **function**. 
   1. For example, reading an audio file from a local file path into RAM. 

2. **Complex isolated problems** (`lvl2`): These are the problems that can be solved using a workflow of multiple logically-connected steps. *Usually*, in a series of function calls. 
   1. For example, downloading audio files from a website, concatenating them, and then converting them to a single audio file. 

3. **Abstract connected problems** (`lvl3`): These are *big picture* problems by understanding the *big picture* of a system. These are the problems that made you want to develop the system in the first place. 
   1. For example, a system that allows users to get audio files from a website, then download them as a single audio file.
   2. These are "solved" by having a mental model of:
      1. The exact requirements of the system (i.e., the problem).
      2. The system architecture (i.e., the solution). E.g., "a web app, where the frontend requests the audio files, and backend processes them, and then returns the final audio file to the frontend".
      3. Optionally: We create a prototype with placeholders for the functions that we will implement later (just to mentally visualize the flow of the system). 

4. **Concrete connected problems** (`lvl4`): These are the problems that are solved by specifying the details of the system architecture then implmenting them. 
   1. E.g., react/fastapi for frontend/backend, streamlit for both, etc. python as main language, uv for managing dependencies, etc.


### "Ok, So Does The AI *Vibe* ✨ With All of These Levels?"

Well...

1. For `lvl1` problems: Yes, AI can easily vibe with them. 

2. For `lvl2` problems: Usually, yes. But...
   1. If the problem is related to a tech stack that the AI is not familiar with, then its *vibeage* will be limited.
      1. E.g., if you ask the AI to write a function that uses a library that it doesn't know about.
      2. This can be mitigated by providing the library's docs yes... but this will not always be a possible option. Examples:
         1. Library has outdated docs.
         2. Library has no docs at all.
         3. Library is not open-source, so you can't even clone it and tell AI to read it.
         4. etc.
   2. If you phrase your request in a very strict way, then the AI could overcomplicate the solution. 
      1. E.g., you ask AI to do A/B/C to get D, but if you've just asked it to do D, then it would have done it in a simpler away.
         1. I.e., under-trusting your AI buddy `:[`.
   3. If you phrase your request in a very vague way, then the AI could over-simplify the solution while neglecting important corner cases. 
      1. E.g., you ask AI to return D, but you forgot to mention that D should be in a specific format, or that it should be sorted in a specific way, etc.
         1. I.e., Assuming that your AI buddy is a mind reader `:[`.

      


## Footnotes

[fn.1]: These levels of complexity are completely subjective, and they are not based on any scientific research. They are just a way for me to mentally categorize a problem when I see it.

## If you Have Any Questions/Suggestions...

Your participation is most welcome! 🔥🙌

&nbsp;

## And If I made a mistake

Then kindly correct me :] <3

![goodbye gif](https://media1.giphy.com/media/z6JcPVxFbsbNE5WNMx/giphy.gif)