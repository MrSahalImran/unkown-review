import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUsername) {
      return NextResponse.json(
        { success: false, message: "Username already taken" },
        { status: 400 }
      );
    }
    const existingUserVerifiedByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserVerifiedByEmail) {
      if(existingUserVerifiedByEmail.isVerified){
        return NextResponse.json(
          { success: false, message: "User already exist with this email" },
          { status: 400 }
        );
      } else {
        const hassedPassword = await bcrypt.hash(password, 10);
        existingUserVerifiedByEmail.password = hassedPassword;
        existingUserVerifiedByEmail.verifyCode = verifyCode;
        existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now()+3600000);
        await existingUserVerifiedByEmail.save();
      }
    } else {
      const hassedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        username: username,
        email: email,
        password: hassedPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }

    // send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      verifyCode,
      password
    );
    if (!emailResponse.success) {
      return NextResponse.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, message: "User registered, Please Verify your email" },{status:201});
  } catch (err: any) {
    console.log(err.message);
    return NextResponse.json(
      { success: false, message: "Error registring user" },
      { status: 400 }
    );
  }
}