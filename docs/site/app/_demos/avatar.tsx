"use client"

import { Avatar, AvatarFallback, AvatarImage } from "sebs7n-ui/avatar"

/** Con imagen y con iniciales */
export function Basico() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>SF</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage alt="" src="https://avatars.githubusercontent.com/u/9919?s=96&v=4" />
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
    </div>
  )
}
