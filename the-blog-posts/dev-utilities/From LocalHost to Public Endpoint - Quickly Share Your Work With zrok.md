_**TOC:**_

{%- # TOC start (generated with https://github.com/derlin/bitdowntoc) -%}

- [Use Case](#use-case)
- [Install zrok to Your OS](#install-zrok-to-your-os)
- [Create an Account](#create-an-account)
- [See The Initial UI of zrok](#see-the-initial-ui-of-zrok)
- [Connect Your Device with Your Account](#connect-your-device-with-your-account)
- [The Magical Part - zrok Reserve and Share](#the-magical-part---zrok-reserve-and-share)
  - [Later Runs](#later-runs)
- [Important Advice](#important-advice)
- [If you Have Any Questions/Suggestions...](#if-you-have-any-questionssuggestions)
- [And If I made a mistake](#and-if-i-made-a-mistake)

{%- # TOC end -%}

---

&nbsp;

## Use Case

Suppose you're using a web server framework like [uvicorn](https://dev.to/kfir-g/understanding-fastapi-fundamentals-a-guide-to-fastapi-uvicorn-starlette-swagger-ui-and-pydantic-2fp7#:~:text=%0A%20%20%0A%20%202.%20Uvicorn%3A%20The%20ASGI%20Server%0A) to run your backend service locally (e.g., on `http://localhost:8000`)

Ok, but that `http://...` is a local URL... So how do we share it publically instead of locally?

Use [zrok](https://docs.zrok.io/docs/getting-started/#whats-a-zrok)! 🌌

(Side note: Check the first 2 paragraphs [here](https://github.com/orgs/ansari-project/projects/3/views/1) for a more eloquent explanation of when to use zrok :])

![spaceship gif](https://media1.giphy.com/media/AWYdAubkFK8yr0cpdE/giphy.gif)

&nbsp;

## Install zrok to Your OS

Based on your Operating System (OS), follow the steps in the `guide` page reached from [here](https://docs.zrok.io/docs/guides/install/).

When you're done, executing `zrok -h` in a [terminal](https://medium.com/@ayogun/shell-vs-bash-vs-powershell-vs-cmd-fa916895aab) should give you the list of commands that you can run using zrok!

Side note 1: Regarding Windows users, the commands written in their [guide page](https://docs.zrok.io/docs/guides/install/windows/) are executed via [powershell](https://www.addictivetips.com/windows-tips/open-powershell-in-a-specific-location/#:~:text=This%20is%20the%20simplest%20way%20to%20open%20PowerShell).

Side note 2: Personally, I just get the `zrok.exe` file, add it to the repository's root folder, add `zrok.exe` to `.gitignore`, then run `zrok` commands in the terminal instead of adding zrok to windows' [PATH](https://janelbrandon.medium.com/understanding-the-path-variable-6eae0936e976) [variable](https://towardsdatascience.com/the-path-variable-for-the-confused-data-scientist-how-to-manage-it-b469bfb45785)... however, that solution is a workaround, and should not be standardized :]

<img width="10%" style="width:10%" src="https://media.giphy.com/media/xo8Ujjb22hsQsZodzs/giphy.gif">

&nbsp;

## Create an Account

Create an account by doing the following:
1. Visit zrok's getting started page [here](https://docs.zrok.io/docs/getting-started/).
2. Click on "Get an Account" under "Hosted zroknet".
3. Click on "sign up" at the bottom of the form.
4. Fill in your credentials then click sign up.
5. You'll then be redirected to `https://myzrok.io/settings`, where you'll fill in the same credentials 
  1. (again ಠ_ಠ)
6. Click `SAVE`, then you'll be presented with this command: `zrok enable yOUrPriVaTeToken`, store this command carefully in a notepad or something, we'll need it soon.
7. Then login to [https://api.zrok.io/](https://api.zrok.io/) by using your credentials...
  1. (again! (╯°□°）╯︵ ┻━┻ )
8. Done!


&nbsp;

Side note: You could've also partially done this via terminal, as shown [here](https://tech-couch.com/post/sharing-local-websites-and-files-with-zrok#setting-up-the-zrok-client)

![are you serious gif](https://media1.giphy.com/media/7HdL5wSUWnVyXk48MR/giphy.gif)

&nbsp;

## See The Initial UI of zrok

Upon successfully logging in, you'll see the [https://api.zrok.io/](https://api.zrok.io/) page looking like this:


![UI of api.zrok.io](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1xiz7wkadsqar2cnc9lu.png)

Now, you can use [NetFoundry's](https://netfoundry.io/why-netfoundry/) public zrok instances to share your web server! Let's see how...

Side note: If you click on the 🔽 icon next to your email, then click on `Enable your environment`, you'll see the command that I told you to store in a notepad :].

&nbsp;

## Connect Your Device with Your Account

Run the `zrok enable yOUrPriVaTeToken` command in your terminal to connect your account with your device.

Then, read the entire `Enabling Your zrok Environment` section from the official docs [here](https://docs.zrok.io/docs/getting-started/#enabling-your-zrok-environment), as it explains the above command, and then shows you what the UI of `api.zrok.io` should now look like.

![I ain't reading all of that gif](https://media1.giphy.com/media/uZjtSy1BYPNcXj5MTA/giphy.gif)

&nbsp;

## The Magical Part - zrok Reserve and Share

Now for the good part, assuming you are currently running your backend server, e.g., something like this (IDE is [VSCode](https://shiftmag.dev/vs-code-171/) btw):

![Uvicorn code and terminal output](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/p9s7jao8cmsuva46d6hq.png)

Then, you'll open another terminal, like so:


![How to open another terminal](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/bwpz55wgzecdbkbk2ljy.png)

Then, execute this command:

`zrok reserve public localhost:8000 -n youruniqueinstancename`

If you don't change the last argument above (which is called a [share token](https://docs.zrok.io/docs/getting-started/#:~:text=my%20share%20was%20given%20the)), the final frontend URL will appear like this: `https://youruniqueinstancename.share.zrok.io`, as can be seen here:

![api.zrok.io after running command](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/14uqrlzfezxnvda7h7jv.png)

As you noticed from the screenshot above, a connection has been reserved with the token name that you used in the last argument of the aforementioned command,and is now configured to [_eventually bind_](https://docs.zrok.io/docs/getting-started/#proxy-backend-mode) with your localhost URL.

To make it _actually bind_ with your localhost, run this final command:

`zrok share reserved youruniqueinstancename`

Now, if we try to send requests using any online REST client tool, e.g., [restninja](https://restninja.io/):


![Using restninja REST client to test the shared zrok instance](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6w9yoyhsi7xvg6acfm5i.png)

You'll see the terminal returning this output:


![Terminal showing requests coming to shared zrok instance](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/x1i5qutushw7m7o5pupq.png)

Which means we can now share this public URL for quickly testing and/or displaying our work with others!

![Mind explosion gif](https://media1.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif)

Side note: To terminate the session, hit `ctrl+c` (windows) or close the terminal from here (still in VSCode):


![How to close the terminal in VSCode](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/77tavq2jawy63u522yqs.png)

Tricky note: the `youruniqueinstancename` token is globally unique. In other words, if a developer "Bob" currently hosts a zrok public URL with this token, and a developer "Steve" **simultaneously** tries to create a public URL with that exact token, it won't work (will give you a `shareConflict` error).

&nbsp;

### Later Runs

In future terminal sessions, it's sufficient to run `zrok share reserved youruniqueinstancename` to start a new session of binding public zrok URL with localhost :].

&nbsp;

## Important Advice

I highly suggest fully reading zrok's [getting started page](https://docs.zrok.io/docs/getting-started/), then all the sub-pages under [concepts](https://docs.zrok.io/docs/concepts/), as they greatly explain the when/where/how's of zrok.

&nbsp;

## If you Have Any Questions/Suggestions...

Your participation is most welcome! 🔥🙌

&nbsp;

## And If I made a mistake

Then kindly correct me :] <3

![goodbye gif](https://media1.giphy.com/media/z6JcPVxFbsbNE5WNMx/giphy.gif)