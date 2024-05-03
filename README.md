This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
code should effectively handles both scenarios of registering a new user and updating a new user and updating an existing but unverified user account with a new passoerd and verifcation code.

if existing userbyemail exists then 
    if existing userbyemail is verfied then
        success:false
    else
        save the updated user
    endif
else
    create a new user with provided details
    save the new user
endif
