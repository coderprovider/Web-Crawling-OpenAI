import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import {
	FolderIcon,
	HomeIcon,
	UsersIcon,
	WindowIcon
} from '@heroicons/react/24/outline'

const Layout = () => {

	return (
		<>
			<div className="flex gap-4 w-full">
				<div className="flex flex-col p-6 w-[200px] h-auto bg-indigo-600">
					<div >
						<div className="flex h-16 shrink-0 items-center">
							<img
								alt="Your Company"
								src="https://tailwindui.com/img/logos/mark.svg?color=white"
								className="h-8 w-auto"
							/>
						</div>
						<div className='flex flex-col gap-2'>
							<Link to="/"
								className='text-indigo-200 hover:bg-indigo-700 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
							>
								<HomeIcon className='text-indigo-200 group-hover:text-white h-6 w-6 shrink-0'
								/>
								Dashboard
							</Link>
							<Link to="/client"
								className='text-indigo-200 hover:bg-indigo-700 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
							>
								<UsersIcon className='text-indigo-200 group-hover:text-white h-6 w-6 shrink-0' />
								Client
							</Link>
							<Link to="/project"
								className='text-indigo-200 hover:bg-indigo-700 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
							>
								<FolderIcon className='text-indigo-200 group-hover:text-white h-6 w-6 shrink-0' />
								Project
							</Link>
							<Link to="/crawl"
								className='text-indigo-200 hover:bg-indigo-700 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
							>
								<WindowIcon className='text-indigo-200 group-hover:text-white h-6 w-6 shrink-0' />
								Crawl
							</Link>

						</div>
					</div>
				</div>
				<div className='w-full'>
					<div className=''>
						<Outlet />
					</div>
				</div>
			</div>
		</>
	)
}
export default Layout
