import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Props = {
  title: string
  description: string
  isFooter?: boolean
  footerLink?: string
  footerTitle?: string
  footerDescription?: string
  children: React.ReactNode
}

export const FormWrapper = ({
  children,
  title,
  description,
  footerTitle,
  isFooter = true,
  footerDescription,
  footerLink,
}: Props) => {
  return (
    <Card className="drop-shadow-none w-full sm:max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          <h2 className="text-2xl dark:text-white text-zinc-950 font-semibold">
            {title}
          </h2>
        </CardTitle>
        <CardDescription className="text-center">
          <p className="text-sm dark:text-gray-400 text-zinc-500">
            {description}
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {isFooter && (
        <CardFooter>
          <div className="text-center text-sm w-full">
            {footerDescription}{' '}
            <Link
              href={footerLink || ''}
              className="underline underline-offset-4"
            >
              {footerTitle}
            </Link>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
